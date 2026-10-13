import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Color, ConeGeometry, CylinderGeometry, IcosahedronGeometry, Object3D } from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'

// Две породы в единицах «высота дерева = 1». Реальный размер задаётся масштабом инстанса.
const SHAPES = {
  // ель: ствол + три конуса
  pine: {
    trunkH: 0.3,
    trunkR: 0.035,
    leaves: ['#2f6b3a', '#3a7a40', '#285c34'],
    foliage: () =>
      mergeGeometries(
        [
          [0.32, 0.4, 0.45],
          [0.25, 0.35, 0.625],
          [0.18, 0.35, 0.825],
        ].map(([r, h, y]) => {
          const g = new ConeGeometry(r, h, 6)
          g.translate(0, y, 0)
          return g
        })
      ),
  },
  // дуб: ствол + крона из трёх граненых «комьев»
  oak: {
    trunkH: 0.45,
    trunkR: 0.05,
    leaves: ['#5b9a3c', '#6aa845', '#4f8a35'],
    foliage: () =>
      mergeGeometries(
        [
          [0.3, 0, 0.65, 0],
          [0.22, 0.15, 0.72, 0.08],
          [0.2, -0.15, 0.6, -0.1],
        ].map(([r, x, y, z]) => {
          const g = new IcosahedronGeometry(r, 0)
          g.translate(x, y, z)
          return g
        })
      ),
  },
}

// Детерминированный генератор случайных чисел: при том же seed лес всегда одинаковый
function mulberry32(a) {
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// расстояние от точки (px, pz) до отрезка (ax, az)-(bx, bz)
function distToSegment(px, pz, ax, az, bx, bz) {
  const dx = bx - ax
  const dz = bz - az
  const len2 = dx * dx + dz * dz
  const t = len2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / len2)) : 0
  return Math.hypot(px - (ax + t * dx), pz - (az + t * dz))
}

// Одна порода — два instancedMesh (стволы и кроны) = 2 draw call на всю рощу
function Forest({ kind, items, leafColors, trunkColor }) {
  const shape = SHAPES[kind]
  const trunkRef = useRef()
  const leafRef = useRef()

  const trunkGeo = useMemo(() => {
    const g = new CylinderGeometry(shape.trunkR, shape.trunkR * 1.3, shape.trunkH, 6)
    g.translate(0, shape.trunkH / 2, 0) // низ ствола в y = 0
    return g
  }, [shape])
  const foliageGeo = useMemo(() => shape.foliage(), [shape])

  useEffect(
    () => () => {
      trunkGeo.dispose()
      foliageGeo.dispose()
    },
    [trunkGeo, foliageGeo]
  )

  useLayoutEffect(() => {
    const trunks = trunkRef.current
    const leaves = leafRef.current
    if (!trunks || !leaves) return
    const dummy = new Object3D()
    const c = new Color()
    const palette = leafColors || shape.leaves
    items.forEach((it, i) => {
      dummy.position.set(it.x, it.y, it.z)
      dummy.rotation.set(0, it.yaw, 0)
      dummy.scale.set(it.w, it.h, it.w)
      dummy.updateMatrix()
      trunks.setMatrixAt(i, dummy.matrix)
      leaves.setMatrixAt(i, dummy.matrix)
      trunks.setColorAt(i, c.set(trunkColor).multiplyScalar(0.85 + it.tint * 0.3))
      leaves.setColorAt(i, c.set(palette[Math.floor(it.tint * palette.length) % palette.length]))
    })
    trunks.instanceMatrix.needsUpdate = true
    leaves.instanceMatrix.needsUpdate = true
    if (trunks.instanceColor) trunks.instanceColor.needsUpdate = true
    if (leaves.instanceColor) leaves.instanceColor.needsUpdate = true
  }, [items, leafColors, trunkColor, shape])

  if (!items.length) return null
  return (
    <>
      <instancedMesh
        key={`t-${items.length}`}
        ref={trunkRef}
        args={[trunkGeo, undefined, items.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.95} flatShading />
      </instancedMesh>
      <instancedMesh
        key={`l-${items.length}`}
        ref={leafRef}
        args={[foliageGeo, undefined, items.length]}
        castShadow
        receiveShadow
        frustumCulled={false}
      >
        <meshStandardMaterial roughness={0.9} flatShading />
      </instancedMesh>

    </>
  )
}

/**
 * Деревья — рощи из низкополигональных ёлок и дубов, один instancedMesh на стволы
 * и один на кроны для каждой породы. Только картинка: ни тел (RigidBody),
 * ни коллайдеров нет, снаряды пролетают сквозь деревья.
 * Использовать внутри <Canvas><Physics>...</Physics></Canvas>.
 *
 * Два режима расстановки:
 *  1. Автоматический (по умолчанию): случайные деревья в прямоугольнике area.
 *  2. Ручной: пропс items — [{ position: [x, y, z], height?, yaw?, kind? }, ...]
 *
 * Пропсы:
 *  type        — 'pine' | 'oak' | 'mixed' (60% елей, 40% дубов), по умолчанию 'mixed'
 *  count       — сколько деревьев разместить автоматически (60)
 *  area        — прямоугольник [minX, maxX, minZ, maxZ] (-40, 40, -40, 40)
 *  seed        — зерно генератора: то же число даёт тот же лес (1)
 *  height      — средняя высота дерева, м (8)
 *  heightVar   — разброс высоты, доля от height (0.35)
 *  minDistance — минимальное расстояние между стволами, м (3)
 *  exclude     — зоны, где деревья не растут:
 *                { circle: [x, z, radius] } или { path: [[x, y, z], ...], width }.
 *                path принимает те же точки, что и компонент Road, так что
 *                дорогу можно обойти так: exclude={[{ path: roadPoints, width: 6 }]}
 *  position    — смещение всей рощи
 *  leafColors  — свои цвета листвы (массив), иначе зелёные по умолчанию для породы
 *  trunkColor  — цвет стволов (#6b4a2b)
 *
 * Пример:
 *  <Trees count={80} area={[-50, 50, -50, 10]} seed={7}
 *         exclude={[{ path: roadPoints, width: 6 }, { circle: [0, 0, 8] }]} />
 */
export default function Trees({
  items,
  type = 'mixed',
  count = 60,
  area = [-40, 40, -40, 40],
  seed = 1,
  height = 8,
  heightVar = 0.35,
  minDistance = 3,
  exclude = [],
  position = [0, 0, 0],
  leafColors,
  trunkColor = '#6b4a2b',
}) {
  const key = JSON.stringify([items, type, count, area, seed, height, heightVar, minDistance, exclude])

  const groups = useMemo(() => {
    const rand = mulberry32(seed)
    const kindOf = () => (type === 'mixed' ? (rand() < 0.6 ? 'pine' : 'oak') : type)
    const make = (x, y, z, h, yaw, kind) => ({
      x,
      y,
      z,
      h,
      w: h * (0.8 + rand() * 0.3), // ширина считается от высоты, чтобы пропорции не «плыли»
      yaw: yaw ?? rand() * Math.PI * 2,
      tint: rand(),
      kind,
    })

    let list = []
    if (items) {
      list = items.map((it) => {
        const [x, y = 0, z] = it.position.length === 3 ? it.position : [it.position[0], 0, it.position[1]]
        return make(x, y, z, it.height ?? height, it.yaw, it.kind ?? kindOf())
      })
    } else {
      const [minX, maxX, minZ, maxZ] = area
      const blocked = (x, z) =>
        exclude.some((e) => {
          if (e.circle) return Math.hypot(x - e.circle[0], z - e.circle[1]) < e.circle[2]
          if (e.path) {
            for (let i = 0; i < e.path.length - 1; i++) {
              const a = e.path[i]
              const b = e.path[i + 1]
              const d = distToSegment(x, z, a[0], a[a.length - 1], b[0], b[b.length - 1])
              if (d < (e.width ?? 4) / 2 + 1) return true
            }
          }
          return false
        })

      for (let tries = 0; list.length < count && tries < count * 30; tries++) {
        const x = minX + rand() * (maxX - minX)
        const z = minZ + rand() * (maxZ - minZ)
        if (blocked(x, z)) continue
        if (list.some((t) => Math.hypot(t.x - x, t.z - z) < minDistance)) continue
        const h = height * (1 + (rand() * 2 - 1) * heightVar)
        list.push(make(x, 0, z, h, undefined, kindOf()))
      }
    }

    const byKind = { pine: [], oak: [] }
    list.forEach((t) => byKind[t.kind].push(t))
    return byKind
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  return (
    <group name="trees" position={position}>
      {Object.entries(groups).map(([kind, list]) => (
        <Forest
          key={kind}
          kind={kind}
          items={list}
          leafColors={leafColors}
          trunkColor={trunkColor}
        />
      ))}
    </group>
  )
}
