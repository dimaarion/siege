import {useEffect, useLayoutEffect, useMemo, useRef} from 'react'
import { Color } from 'three'
import { CuboidCollider, InstancedRigidBodies, RigidBody } from '@react-three/rapier'
import useGameStore from "../store.js";
import Road from "../components/Road.jsx";
import Trees from "../components/Trees.jsx";
import Hedgehog from "../components/Hedgehog.jsx";
import {Goblin, Sensor} from "../components/Objects.jsx";

// Оттенки дерева — блоки чередуют цвета, чтобы башня выглядела живее
const WOOD = ['#a8743f', '#b9824a', '#9a6a38', '#c28d55']

const GOBLIN_SKIN = '#6fb83f'
const GOBLIN_DARK = '#4f8a2b'

// Высота базовой модели гоблина (до макушки), в её собственных единицах
const GOBLIN_BASE_HEIGHT = 1.4

// Все кирпичи башни — один instancedMesh, каждый инстанс = своё физическое тело.
// items: [{ key, position, rotation, size, color }] — массив должен быть
// стабильным (useMemo), иначе тела пересоздаются при каждом рендере.
function Bricks({ items }) {
  const meshRef = useRef()

  // единичный куб; реальный размер кирпича задаётся через scale инстанса
  // (rapier применяет этот scale и к коллайдеру)
  const instances = useMemo(
    () =>
      items.map(({ key, position, rotation, size }) => ({
        key,
        position,
        rotation,
        scale: size,
      })),
    [items]
  )

  // у каждого кирпича свой оттенок дерева
  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const c = new Color()
    items.forEach((it, i) => {
      c.set(it.color)
      mesh.setColorAt(i, c)
    })
    mesh.instanceColor.needsUpdate = true
  }, [items])

  return (
    <InstancedRigidBodies
      instances={instances}
      colliders="cuboid"
      density={0.6}
      friction={0.8}
      restitution={0.05}
      name={"brick-rig"}
      userData={{name:"brick",active:true}}
    >
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, items.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
        name={"brick"}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
    </InstancedRigidBodies>
  )
}










export default function WoodenTowerGoblin({
  position = [0, 0, 0],
  floorHeight = 10,
  blockHeight = 0.83,
  courses = Math.max(2, Math.round(floorHeight / blockHeight)),
}) {
  const [px, py, pz] = position

  const SIDES = 5
  const BLOCKS_PER_WALL = 4
  const R = floorHeight / 3 // радиус до осевой линии стен
  const t = floorHeight * 0.05 // толщина стены
  const h = t / 2
  const wallLen = 2 * R * Math.sin(Math.PI / SIDES) // сторона пятиугольника
  const courseH = floorHeight / courses
  const roofH = floorHeight * 0.03
  const goblinHeight = floorHeight / 5

  // Заход на угол (внутренний угол 108°, половина = 54°)
  const EXT = h / Math.tan((54 * Math.PI) / 180) // насколько стена выступает за вершину: ~0.727·h
  const CUT = 1.1756 * h // насколько встречная стена не доходит до вершины

  // вершины пятиугольника (как у cylinderGeometry с 5 гранями)
  const verts = Array.from({ length: SIDES }, (_, i) => {
    const a = (i * 2 * Math.PI) / SIDES
    return [R * Math.sin(a), R * Math.cos(a)]
  })

  const bricks = useMemo(() => {
    const out = []
    for (let i = 0; i < SIDES; i++) {
      const [x1, z1] = verts[i]
      const [x2, z2] = verts[(i + 1) % SIDES]
      const dx = (x2 - x1) / wallLen
      const dz = (z2 - z1) / wallLen
      const ry = Math.atan2(-dz, dx) // поворот кирпича вдоль стены

      for (let c = 0; c < courses; c++) {
        const even = c % 2 === 0
        // чётные ряды: стена заходит на угол в начале, укорочена в конце;
        // нечётные — наоборот
        const start = even ? -EXT : CUT
        const end = even ? wallLen - CUT : wallLen + EXT
        const segLen = end - start
        const bw = segLen / BLOCKS_PER_WALL
        const y = py + c * courseH + courseH / 2

        for (let k = 0; k < BLOCKS_PER_WALL; k++) {
          const s = start + (k + 0.5) * bw
          out.push({
            key: `b-${i}-${c}-${k}`,
            position: [px + x1 + dx * s, y, pz + z1 + dz * s],
            rotation: [0, ry, 0],
            size: [bw - 0.01, courseH - 0.002, t],
            color: WOOD[(i + c * 2 + k) % WOOD.length],
          })
        }
      }
    }

    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    useGameStore.getState().setBricks(bricks.length)
  }, [bricks]);

  const roofY = py + floorHeight + roofH / 2
const hed = [
    [0,2,-50],
    [10,2,-50],
    [-10,2,-50],
    [0,2,50],
    [10,2,50],
    [-10,2,50]
]
  return (
    <group>
      {/* кирпичная кладка: все кирпичи — InstancedRigidBodies */}
      <Bricks items={bricks} />

      {/* крыша — пятиугольная плита (призма с 5 гранями), башня внутри полая */}
      <RigidBody
        position={[px, roofY, pz]}
        colliders="hull"
        density={0.6}
        friction={0.8}
        restitution={0.05}
      >
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[R * 1.15, R * 1.15, roofH, SIDES]} />
          <meshStandardMaterial color="#8a5c2e" roughness={0.85} flatShading />
        </mesh>
      </RigidBody>

      {/* гоблин на крыше */}
      <Goblin
        position={[px, py + floorHeight + roofH + 0.002, pz]}
        height={goblinHeight}
      />
      <Sensor position={[px,0.5,pz]} />
      <Road points={[[0, 0, 200], [0, 0, -200]]} colliders={false} />
      <Trees exclude={[[0, 0, 200], [0, 0, -200]]} height={25} count={80} area={[-300, 300, -300, 300]} seed={10} />
      {hed.map((el,i)=><Hedgehog key={i + "ej"} scale={[4,4,4]} position={el} />)}
    </group>
  )
}
