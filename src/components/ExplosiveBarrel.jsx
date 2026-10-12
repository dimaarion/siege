import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { RigidBody, CylinderCollider } from "@react-three/rapier";
import * as THREE from "three";
import Explosion from "./Explosion";

/**
 * Бочка, которая взрывается, когда её сдвинули с места.
 *
 * Бочка сначала "устаивается" (settleTime) — падает и успокаивается, после чего
 * запоминается её исходное положение. Если дальше она сместилась больше чем на
 * `threshold` метров, происходит взрыв (используется компонент Explosion).
 * Взрыв толкает соседние бочки, поэтому возможна цепная реакция.
 *
 * Props:
 *  position — [x, y, z] стартовая позиция (центр бочки)
 *  height, radius — размеры бочки, м
 *  mass — масса, кг
 *  threshold — смещение для взрыва, м
 *  settleTime — сколько секунд ждать, прежде чем запомнить исходное положение
 *  blastRadius — радиус взрыва, м (не меньше 1)
 *  blastForce — импульс взрыва в эпицентре
 *  onExploded(position: Vector3) — вызывается в момент взрыва
 *  onDone — вызывается после окончания эффекта (удалите бочку из списка)
 */
export default function ExplosiveBarrel({
  position = [0, 0.6, 0],
  height = 1.2,
  radius = 0.4,
  mass = 30,
  threshold = 0.3,
  settleTime = 0.5,
  blastRadius = 2,
  blastForce = 40,
  color = "#c0392b",
  onExploded,
  onDone,
}) {
  const body = useRef();
  const age = useRef(0);
  const origin = useRef(null);
  const exploded = useRef(false);
  const [boomAt, setBoomAt] = useState(null);

  useFrame((_, dt) => {
    if (exploded.current || !body.current) return;

    age.current += dt;
    if (age.current < settleTime) return;

    const p = body.current.translation();

    if (!origin.current) {
      origin.current = new THREE.Vector3(p.x, p.y, p.z);
      return;
    }

    const dist = origin.current.distanceTo(new THREE.Vector3(p.x, p.y, p.z));
    if (dist > threshold) {
      exploded.current = true;
      const at = new THREE.Vector3(p.x, p.y, p.z);
      onExploded?.(at);
      setBoomAt(at.toArray());
    }
  });

  if (boomAt) {
    return (
      <Explosion
        position={boomAt}
        radius={blastRadius}
        force={blastForce}
        onDone={onDone}
      />
    );
  }

  return (
    <RigidBody ref={body} colliders={false} position={position}>
      <CylinderCollider args={[height / 2, radius]} mass={mass} friction={0.8} />
      <mesh castShadow receiveShadow>
        <cylinderGeometry args={[radius, radius, height, 24]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* ободы */}
      {[-0.3, 0.3].map((y) => (
        <mesh key={y} position={[0, y * height, 0]}>
          <cylinderGeometry args={[radius * 1.03, radius * 1.03, height * 0.06, 24]} />
          <meshStandardMaterial color="#7f1d14" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}
    </RigidBody>
  );
}
