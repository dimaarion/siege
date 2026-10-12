import { useEffect, useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useRapier } from "@react-three/rapier";
import * as THREE from "three";

const MIN_RADIUS = 1; // метры

/**
 * Взрыв: срабатывает один раз в момент монтирования.
 * Рендерите его по событию и убирайте в onDone.
 *
 * Props:
 *  position — [x, y, z] эпицентр
 *  radius — радиус поражения, м (по умолчанию 1, не меньше 1)
 *  maxRadius — верхний предел радиуса, м (по умолчанию без ограничения)
 *  force — импульс в эпицентре (Н·с)
 *  upwardBias — доп. подброс вверх (0..1)
 *  duration — длительность эффекта, с
 *  onDone — вызывается после окончания эффекта
 */
export default function Explosion({
  position = [0, 0, 0],
  radius: radiusProp = 1,
  maxRadius = Infinity,
  force = 100,
  upwardBias = 0.3,
  duration = 1.5,
  onDone,
}) {
  // Радиус не меньше 1 м; верхний предел задаёте вы через maxRadius
  const radius = Math.max(MIN_RADIUS, Math.min(radiusProp, maxRadius));
  const { world, rapier } = useRapier();
  const t = useRef(0);
  const finished = useRef(false);
  const fired = useRef(false);
  const sphere = useRef();
  const light = useRef();
  const sparks = useRef();
  const COUNT = 24;

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
          .multiplyScalar((2 + Math.random() * 2) * radius),
        p: new THREE.Vector3(),
        s: (0.03 + Math.random() * 0.05) * radius,
      })),
    [radius]
  );

  // Физика: один раз при появлении
  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    const [cx, cy, cz] = position;
    const seen = new Set();

    world.intersectionsWithShape(
      { x: cx, y: cy, z: cz },
      { x: 0, y: 0, z: 0, w: 1 },
      new rapier.Ball(radius),
      (collider) => {
        const rb = collider.parent();
        if (!rb || seen.has(rb.handle) || !rb.isDynamic()) return true;
        seen.add(rb.handle);

        const com = rb.worldCom();
        const dir = new THREE.Vector3(com.x - cx, com.y - cy, com.z - cz);
        const dist = dir.length();
        const falloff = Math.max(0, 1 - dist / radius);
        if (falloff <= 0) return true;

        if (dist < 1e-3) dir.set(0, 1, 0);
        else dir.divideScalar(dist);
        dir.y += upwardBias;
        dir.normalize();

        const j = force * falloff;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Визуал
  useFrame((_, dt) => {
    t.current += dt;
    const k = Math.min(t.current / duration, 1);
    const ease = 1 - Math.pow(1 - k, 3);

    sphere.current.scale.setScalar(Math.max(0.01, ease * radius));
    sphere.current.material.opacity = 0.9 * (1 - k);
    light.current.intensity = 15 * (1 - k) * (1 - k);

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
      <pointLight ref={light} color="#ff9a3c" distance={radius * 4} intensity={15} />
      <instancedMesh ref={sparks} args={[null, null, COUNT]} frustumCulled={false}>
        <sphereGeometry args={[1, 6, 6]} />
        <meshBasicMaterial color="#ffd27a" />
      </instancedMesh>
    </group>
  );
}
