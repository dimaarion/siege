import { forwardRef, useCallback, useEffect, useRef, useState } from "react";
import { RigidBody, BallCollider } from "@react-three/rapier";
import { getAmmo, ammoMass } from "../action.js";

// Тела с такими userData.name не ломают ядро (части катапульты)
const DEFAULT_IGNORE = ["beam", "catapult"];

const RING_ROTATIONS = [
  [Math.PI / 2, 0, 0],
  [0, 0, 0],
  [0, Math.PI / 2, 0],
];

/** Только внешний вид ядра, без физики. Подходит и для меню выбора снарядов. */
export function AmmoMesh({ type = "stone", radius = 0.3 }) {
  const { visual } = getAmmo(type);
  const transparent = visual.opacity !== undefined && visual.opacity < 1;

  return (
    <group>
      <mesh castShadow receiveShadow>
        {visual.flat ? (
          <icosahedronGeometry args={[radius, 1]} />
        ) : (
          <sphereGeometry args={[radius, 32, 24]} />
        )}
        <meshStandardMaterial
          color={visual.color}
          roughness={visual.roughness}
          metalness={visual.metalness}
          flatShading={!!visual.flat}
          transparent={transparent}
          opacity={visual.opacity ?? 1}
        />
      </mesh>

      {visual.bands &&
        RING_ROTATIONS.slice(0, visual.bands.count).map((rot, i) => (
          <mesh key={i} rotation={rot} castShadow>
            <torusGeometry args={[radius, radius * 0.07, 8, 32]} />
            <meshStandardMaterial color={visual.bands.color} roughness={0.9} />
          </mesh>
        ))}
    </group>
  );
}

/**
 * Ядро с физикой.
 *
 * type      — id или ключ материала ("hay", "wood", ..., "lead")
 * radius    — радиус; при одинаковом радиусе массу определяет только плотность
 * position  — стартовая позиция (если не задана, ядро ставится само, например через setTranslation)
 * velocity  — начальная скорость [x, y, z], применяется один раз при создании.
 *             Для выстрела катапульты можно вызвать ref.current.applyImpulse(...)
 * armed     — false: ядро не ломается (например, пока лежит в корзине). По умолчанию true.
 * ignore    — имена userData.name тел, удар о которые не ломает ядро
 *             (по умолчанию "beam" и "catapult").
 * onBreak   — вызывается, когда хрупкое ядро рассыпалось:
 *             ({ type, position, force, radius }). Ядро после этого исчезает,
 *             а осколки можно создать в игре по этим данным.
 */
const Cannonball = forwardRef(function Cannonball(
  {
    type = "stone",
    radius = 1,
    position,
    velocity,
    onBreak,
    armed = true,
    ignore = DEFAULT_IGNORE,
    ...rest
  },
  ref
) {
  const ammo = getAmmo(type);
  const body = useRef(null);
  const [broken, setBroken] = useState(false);

  const setRefs = useCallback(
    (node) => {
      body.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );

  const handleForce = useCallback(
    (payload) => {
      if (broken || !armed || !ammo.breakForce) return;
      if (payload.totalForceMagnitude < ammo.breakForce) return;
      // Удар о катапульту ядро не ломает
      const other = payload.other;
      const info =
        other?.rigidBodyObject?.userData ??
        other?.rigidBody?.userData ??
        other?.colliderObject?.userData;
      if (info?.name && ignore.includes(info.name)) return;
      const p = body.current?.translation();
      setBroken(true);
      onBreak?.({
        type: ammo.key,
        position: p ? [p.x, p.y, p.z] : position ?? [0, 0, 0],
        force: payload.totalForceMagnitude,
        radius,
      });
    },
    [broken, armed, ignore, ammo, onBreak, position, radius]
  );

  // Rapier заново применяет проп linearVelocity при каждом рендере (и падает на undefined),
  // поэтому начальную скорость задаём один раз вручную.
  useEffect(() => {
    if (velocity) {
      body.current?.setLinvel({ x: velocity[0], y: velocity[1], z: velocity[2] }, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (broken) return null;

  return (
    <RigidBody
      ref={setRefs}
      {...(position ? { position } : {})}
      colliders={false}
      onContactForce={ammo.breakForce ? handleForce : undefined}
      userData={{ kind: "ammo", type: ammo.key, mass: ammoMass(ammo.key, radius) }}
      {...rest}
    >
      <BallCollider
        args={[radius]}
        density={ammo.density}
        restitution={ammo.restitution}
        friction={ammo.friction}
        contactForceEventThreshold={ammo.breakForce ?? 0}
      />
      <AmmoMesh type={ammo.key} radius={radius} />
    </RigidBody>
  );
});

export default Cannonball;

// Готовые компоненты под каждый материал: <StoneBall position={[0, 2, 0]} />
const make = (key, name) => {
  const Component = forwardRef((props, ref) => (
    <Cannonball ref={ref} type={key} {...props} />
  ));
  Component.displayName = name;
  return Component;
};

export const HayBall = make("hay", "HayBall");
export const WoodBall = make("wood", "WoodBall");
export const IceBall = make("ice", "IceBall");
export const GroundBall = make("ground", "GroundBall");
export const BrickBall = make("brick", "BrickBall");
export const ConcreteBall = make("concrete", "ConcreteBall");
export const StoneBall = make("stone", "StoneBall");
export const CastIronBall = make("cast_iron", "CastIronBall");
export const LeadBall = make("lead", "LeadBall");
