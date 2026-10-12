import { useRef, useState, useMemo, useCallback } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, BallCollider, useRapier } from "@react-three/rapier";
import * as THREE from "three";

/** Визуальный взрыв: расширяющаяся сфера + вспышка света + искры. */
function Blast({ position, radius, duration = 1, onDone }) {
  const t = useRef(0);
  const finished = useRef(false);
  const sphere = useRef();
  const light = useRef();
  const sparks = useRef();
  const COUNT = 40;

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const particles = useMemo(
    () =>
      Array.from({ length: COUNT }, () => ({
        v: new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() * 0.8 + 0.2,
          Math.random() - 0.5
        )
          .normalize()
          .multiplyScalar(4 + Math.random() * radius * 1.5),
        p: new THREE.Vector3(),
        s: 0.05 + Math.random() * 0.08,
      })),
    [radius]
  );

  useFrame((_, dt) => {
    t.current += dt;
    const k = Math.min(t.current / duration, 1);
    const ease = 1 - Math.pow(1 - k, 3);

    sphere.current.scale.setScalar(Math.max(0.01, ease * radius * 0.6));
    sphere.current.material.opacity = 0.9 * (1 - k);
    light.current.intensity = 80 * (1 - k) * (1 - k);

    particles.forEach((d, i) => {
      d.v.y -= 9.8 * dt;
      d.p.addScaledVector(d.v, dt);
      dummy.position.copy(d.p);
      dummy.scale.setScalar(d.s * (1 - k));
      dummy.updateMatrix();
      sparks.current.setMatrixAt(i, dummy.matrix);
    });
    sparks.current.instanceMatrix.needsUpdate = true;

    if (k >= 1 && !finished.current) {
      finished.current = true;
      onDone?.();
    }
  });

  return (
    <group position={position}>
      <mesh ref={sphere}>
        <sphereGeometry args={[1, 24, 24]} />
        <meshBasicMaterial color="#ffb347" transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <pointLight ref={light} color="#ff9a3c" distance={radius * 3} intensity={80} />
      <instancedMesh ref={sparks} args={[null, null, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ffd27a" />
      </instancedMesh>
    </group>
  );
}

/**
 * Снаряд, который взрывается по таймеру и/или при первом столкновении.
 * При взрыве все динамические тела в blastRadius получают радиальный импульс
 * (затухает с расстоянием).
 *
 * Props:
 *  position, velocity — начальные позиция и скорость [x, y, z]
 *  radius — радиус снаряда
 *  mass — масса снаряда
 *  fuse — секунд до взрыва (Infinity = только по столкновению)
 *  explodeOnContact — взрываться при столкновении
 *  blastRadius — радиус поражения
 *  blastForce — импульс в эпицентре (Н·с)
 *  upwardBias — доп. подброс вверх (0..1)
 *  onExploded(center: Vector3) — вызывается в момент взрыва
 *  onDone — вызывается после окончания эффекта (удалите снаряд из списка)
 */
export default function ExplodingProjectile({
  position = [0, 2, 0],
  velocity = [0, 0, -20],
  radius = 0.2,
  mass = 1,
  fuse = 3,
  explodeOnContact = true,
  armDelay = 0.05,
  blastRadius = 6,
  blastForce = 60,
  upwardBias = 0.4,
  color = "#ff5533",
  onExploded,
  onDone,
}) {
  const body = useRef();
  const age = useRef(0);
  const exploded = useRef(false);
  const [blast, setBlast] = useState(null);
  const { world, rapier } = useRapier();

  const detonate = useCallback(() => {
    if (exploded.current || !body.current) return;
    exploded.current = true;

    const c = body.current.translation();
    const center = new THREE.Vector3(c.x, c.y, c.z);
    const selfHandle = body.current.handle;
    const seen = new Set();

    world.intersectionsWithShape(
      c,
      { x: 0, y: 0, z: 0, w: 1 },
      new rapier.Ball(blastRadius),
      (collider) => {
        const rb = collider.parent();
        if (!rb || rb.handle === selfHandle || seen.has(rb.handle) || !rb.isDynamic()) {
          return true; // продолжаем обход
        }
        seen.add(rb.handle);

        const com = rb.worldCom();
        const dir = new THREE.Vector3(com.x - center.x, com.y - center.y, com.z - center.z);
        const dist = dir.length();
        const falloff = Math.max(0, 1 - dist / blastRadius);
        if (falloff <= 0) return true;

        if (dist < 1e-3) dir.set(0, 1, 0);
        else dir.divideScalar(dist);
        dir.y += upwardBias;
        dir.normalize();

        const j = blastForce * falloff;
        rb.applyImpulse({ x: dir.x * j, y: dir.y * j, z: dir.z * j }, true);
        rb.applyTorqueImpulse(
          {
            x: (Math.random() - 0.5) * j * 0.2,
            y: (Math.random() - 0.5) * j * 0.2,
            z: (Math.random() - 0.5) * j * 0.2,
          },
          true
        );
        return true;
      }
    );

    onExploded?.(center);
    setBlast(center.toArray());
  }, [world, rapier, blastRadius, blastForce, upwardBias, onExploded]);

  useFrame((_, dt) => {
    if (exploded.current) return;
    age.current += dt;
    if (age.current >= fuse) detonate();
  });

  if (blast) {
    return <Blast position={blast} radius={blastRadius} onDone={onDone} />;
  }

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={position}
      linearVelocity={velocity}
      ccd
      onCollisionEnter={() => {
        if (explodeOnContact && age.current > armDelay) detonate();
      }}
    >
      <BallCollider args={[radius]} mass={mass} restitution={0.3} />
      <mesh castShadow>
        <sphereGeometry args={[radius, 20, 20]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.6} />
      </mesh>
    </RigidBody>
  );
}
