import { useLayoutEffect, useMemo, useRef } from 'react'
import { Color } from 'three'
import { CuboidCollider, InstancedRigidBodies, RigidBody } from '@react-three/rapier'

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
    >
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, items.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.85} />
      </instancedMesh>
    </InstancedRigidBodies>
  )
}

// Часть гоблина. s — масштаб, solid — есть коллайдер, иначе чисто декор
function Part({ position, size, color, s, solid = false }) {
  const p = position.map((v) => v * s)
  const sz = size.map((v) => v * s)
  return (
    <>
      <mesh position={p} castShadow>
        <boxGeometry args={sz} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {solid && (
        <CuboidCollider position={p} args={[sz[0] / 2, sz[1] / 2, sz[2] / 2]} />
      )}
    </>
  )
}

// Гоблин из блоков — одно тело с несколькими коллайдерами.
// Низ ног находится в y = 0 относительно position.
function Goblin({ position = [0, 0, 0], height }) {
  const s = height / GOBLIN_BASE_HEIGHT
  return (
    <RigidBody
      position={position}
      colliders={false}
      density={0.8}
      friction={0.7}
      restitution={0.1}
    >
      {/* ноги */}
      <Part s={s} solid position={[-0.2, 0.2, 0]} size={[0.25, 0.4, 0.25]} color={GOBLIN_DARK} />
      <Part s={s} solid position={[0.2, 0.2, 0]} size={[0.25, 0.4, 0.25]} color={GOBLIN_DARK} />

      {/* туловище и пояс */}
      <Part s={s} solid position={[0, 0.65, 0]} size={[0.7, 0.5, 0.4]} color={GOBLIN_SKIN} />
      <Part s={s} position={[0, 0.5, 0]} size={[0.74, 0.14, 0.44]} color="#6b4a2b" />

      {/* руки */}
      <Part s={s} solid position={[-0.46, 0.65, 0]} size={[0.18, 0.45, 0.18]} color={GOBLIN_SKIN} />
      <Part s={s} solid position={[0.46, 0.65, 0]} size={[0.18, 0.45, 0.18]} color={GOBLIN_SKIN} />

      {/* дубинка в правой руке */}
      <Part s={s} position={[0.5, 1.0, 0.1]} size={[0.14, 0.5, 0.14]} color="#7a5230" />
      <Part s={s} position={[0.5, 1.3, 0.1]} size={[0.22, 0.2, 0.22]} color="#7a5230" />

      {/* голова */}
      <Part s={s} solid position={[0, 1.15, 0]} size={[0.6, 0.5, 0.5]} color={GOBLIN_SKIN} />

      {/* острые уши */}
      <Part s={s} position={[-0.48, 1.25, 0]} size={[0.36, 0.12, 0.1]} color={GOBLIN_SKIN} />
      <Part s={s} position={[0.48, 1.25, 0]} size={[0.36, 0.12, 0.1]} color={GOBLIN_SKIN} />

      {/* нос */}
      <Part s={s} position={[0, 1.1, 0.3]} size={[0.12, 0.14, 0.14]} color={GOBLIN_DARK} />

      {/* глаза */}
      <Part s={s} position={[-0.15, 1.24, 0.26]} size={[0.14, 0.14, 0.04]} color="#f5f5dc" />
      <Part s={s} position={[0.15, 1.24, 0.26]} size={[0.14, 0.14, 0.04]} color="#f5f5dc" />
      <Part s={s} position={[-0.15, 1.24, 0.29]} size={[0.06, 0.06, 0.03]} color="#111" />
      <Part s={s} position={[0.15, 1.24, 0.29]} size={[0.06, 0.06, 0.03]} color="#111" />

      {/* рот и зубы */}
      <Part s={s} position={[0, 0.98, 0.26]} size={[0.3, 0.07, 0.04]} color="#2a1a14" />
      <Part s={s} position={[-0.1, 1.02, 0.28]} size={[0.05, 0.06, 0.03]} color="#fffbe6" />
      <Part s={s} position={[0.1, 1.02, 0.28]} size={[0.05, 0.06, 0.03]} color="#fffbe6" />
    </RigidBody>
  )
}

/**
 * Пятиугольная полая деревянная башня из блоков в кирпичной кладке
 * (перевязка швов) с одним гоблином на крыше. Высота этажа — 10 м.
 * Использовать внутри <Canvas><Physics>...</Physics></Canvas>.
 *
 * Пропсы:
 *  position    — позиция центра основания башни
 *  floorHeight — высота этажа в метрах, по умолчанию 10
 *  courses     — число рядов кладки по высоте, по умолчанию 24 (блок ~0.42 м)
 *
 * Как устроена кладка:
 *  в каждой стене по 4 блока в ряду; соседние ряды сдвинуты примерно на
 *  полблока, так что вертикальные швы не совпадают. В углах ряды чередуют,
 *  какая стена заходит на угол (как «ёлочка» в срубе), поэтому угловые швы
 *  тоже перевязаны, а блоки не пересекаются.
 *
 * Пропорции при floorHeight = 10 (катапульта 15 м → башня 2/3 от неё):
 *  радиус пятиугольника ~3.3 м, сторона ~3.9 м, толщина стены 0.5 м,
 *  блок ~0.95 × 0.42 × 0.5 м, гоблин ~2 м.
 *  Всего 5 × 4 × 24 = 480 кирпичей — один instancedMesh на всю башню
 *  (InstancedRigidBodies): 1 draw call вместо 480.
 */
export default function WoodenTowerGoblin({
  position = [0, 0, 0],
  floorHeight = 10,
  courses = 24,
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
  }, [px, py, pz, floorHeight, courses])

  const roofY = py + floorHeight + roofH / 2

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
    </group>
  )
}
