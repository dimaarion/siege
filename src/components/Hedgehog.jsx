import { useMemo } from "react";
import * as THREE from "three";
import { RigidBody, CuboidCollider } from "@react-three/rapier";

const UP = new THREE.Vector3(0, 1, 0);
const DIAGONAL = new THREE.Vector3(1, 1, 1).normalize();

/**
 * Противотанковый ёж: три балки, пересекающиеся в центре.
 * Неподвижное физическое тело, на котором катапульта упирается в границу зоны.
 *
 * position  — точка на земле, куда ёж ставится [x, y, z]
 * rotationY — поворот вокруг вертикальной оси, радианы
 * length    — длина каждой балки
 * thickness — толщина балки
 */
export default function Hedgehog({
  position = [0, 0, 0],
  rotationY = 0,
  length = 2,
  thickness = 0.18,
  color = "#6b7280",
  ...props
}) {
  const { quaternion, lift } = useMemo(() => {
    // Наклоняем конструкцию так, чтобы диагональ (1,1,1) смотрела вверх:
    // ёж стоит на трёх концах балок, как настоящий.
    const tilt = new THREE.Quaternion().setFromUnitVectors(DIAGONAL, UP);
    const spin = new THREE.Quaternion().setFromAxisAngle(UP, rotationY);
    return {
      quaternion: spin.multiply(tilt).toArray(),
      // Высота нижнего угла над центром, чтобы ёж касался земли, а не уходил в неё.
      lift: (length + 2 * thickness) / (2 * Math.sqrt(3)),
    };
  }, [rotationY, length, thickness]);

  const beams = [
    [length, thickness, thickness],
    [thickness, length, thickness],
    [thickness, thickness, length],
  ];

  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={[position[0], position[1] + lift, position[2]]}
      quaternion={quaternion}
      {...props}
    >
      {beams.map((size, i) => (
        <CuboidCollider key={`c${i}`} args={size.map((v) => v / 2)} />
      ))}
      {beams.map((size, i) => (
        <mesh key={`m${i}`} castShadow receiveShadow>
          <boxGeometry args={size} />
          <meshStandardMaterial color={color} roughness={0.7} metalness={0.5} />
        </mesh>
      ))}
    </RigidBody>
  );
}

/**
 * Ряд ежей между двумя точками.
 * Шаг между ежами делайте не больше 0.8 длины балки, чтобы не оставалось щелей.
 */
export function HedgehogRow({
  from = [-4, 0, 0],
  to = [4, 0, 0],
  count = 5,
  ...props
}) {
  const points = Array.from({ length: count }, (_, i) => {
    const t = count === 1 ? 0 : i / (count - 1);
    return [
      from[0] + (to[0] - from[0]) * t,
      from[1] + (to[1] - from[1]) * t,
      from[2] + (to[2] - from[2]) * t,
    ];
  });

  return (
    <>
      {points.map((p, i) => (
        <Hedgehog key={i} position={p} rotationY={i * 0.5} {...props} />
      ))}
    </>
  );
}
