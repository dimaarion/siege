import { useLayoutEffect, useMemo, useRef } from 'react'
import { CanvasTexture, Color, Object3D, RepeatWrapping, SRGBColorSpace } from 'three'
import { CuboidCollider, CylinderCollider } from '@react-three/rapier'

// Процедурная текстура булыжной мостовой (без внешних файлов)
function makeCobbleTexture(base, seam) {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')

  ctx.fillStyle = seam
  ctx.fillRect(0, 0, size, size)

  const cols = 6
  const rows = 6
  const cw = size / cols
  const rh = size / rows
  const baseColor = new Color(base)

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // детерминированный «шум», чтобы текстура всегда выглядела одинаково
      const n = Math.abs(Math.sin((r * 12.9898 + c * 78.233) * 43758.5453)) % 1
      const shade = 0.82 + n * 0.36
      const col = baseColor.clone().multiplyScalar(shade)
      ctx.fillStyle = `#${col.getHexString()}`
      const off = r % 2 ? cw / 2 : 0
      const x = c * cw + off + 2
      const y = r * rh + 2
      ctx.beginPath()
      ctx.roundRect(x, y, cw - 4, rh - 4, 8)
      ctx.fill()
      // перенос камня, вылезшего за правый край, чтобы текстура бесшовно тайлилась
      if (x + cw - 4 > size) {
        ctx.beginPath()
        ctx.roundRect(x - size, y, cw - 4, rh - 4, 8)
        ctx.fill()
      }
    }
  }

  const tex = new CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = RepeatWrapping
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// Бордюрные камни вдоль обеих сторон дороги — один instancedMesh, без физики
function EdgeStones({ segments, width, thickness, color }) {
  const meshRef = useRef()

  const placements = useMemo(() => {
    const out = []
    const stoneLen = 0.7
    segments.forEach((seg) => {
      const count = Math.max(1, Math.round(seg.length / stoneLen))
      const step = seg.length / count
      const nx = seg.dz // нормаль к направлению дороги (в плоскости XZ)
      const nz = -seg.dx
      for (let i = 0; i < count; i++) {
        const along = -seg.length / 2 + (i + 0.5) * step
        for (const side of [-1, 1]) {
          const jitter = Math.abs(Math.sin((i * 7.13 + side * 3.7 + seg.index * 11.9) * 12.9898))
          const offset = side * (width / 2 + 0.12)
          out.push({
            x: seg.cx + seg.dx * along + nx * offset,
            z: seg.cz + seg.dz * along + nz * offset,
            yaw: seg.yaw + (jitter - 0.5) * 0.12,
            h: 0.14 + jitter * 0.08,
            len: step * 0.92,
            shade: 0.8 + jitter * 0.4,
          })
        }
      }
    })
    return out
  }, [segments, width])

  useLayoutEffect(() => {
    const mesh = meshRef.current
    if (!mesh) return
    const dummy = new Object3D()
    const c = new Color()
    placements.forEach((p, i) => {
      dummy.position.set(p.x, p.h / 2 - thickness * 0.2, p.z)
      dummy.rotation.set(0, p.yaw, 0)
      dummy.scale.set(0.3, p.h, p.len)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
      c.set(color).multiplyScalar(p.shade)
      mesh.setColorAt(i, c)
    })
    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
  }, [placements, thickness, color])

  if (!placements.length) return null
  return (
    <instancedMesh
      key={placements.length}
      ref={meshRef}
      args={[undefined, undefined, placements.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.95} />
    </instancedMesh>
  )
}

/**
 * Дорога — ломаная линия из прямых участков, плоская, неподвижная.
 * Без RigidBody: коллайдеры стоят сами по себе (в Rapier это неподвижные
 * коллайдеры без тела), а если физика не нужна, их можно отключить пропсом colliders.
 * Верх полотна лежит на высоте position.y (по умолчанию y = 0, то есть вровень с землёй).
 * Использовать внутри <Canvas><Physics>...</Physics></Canvas>.
 *
 * Пропсы:
 *  points      — точки оси дороги [[x, y, z], ...] относительно position; y игнорируется.
 *                По умолчанию прямая в 40 м вдоль оси Z.
 *  width       — ширина полотна, м (4)
 *  thickness   — толщина полотна, м (0.3); именно на столько дорога уходит под y = 0
 *  position    — смещение всей дороги
 *  color       — цвет булыжника (#8c8a82)
 *  seamColor   — цвет швов между камнями (#4a4740)
 *  edgeStones  — рисовать ли бордюр по краям (true)
 *  colliders   — делать ли коллайдеры (true). false: дорога только картинка
 *  friction    — трение коллайдера (0.9)
 *  restitution — упругость коллайдера (0.05)
 *
 * Как устроено:
 *  - тела (RigidBody) нет вообще: коллайдеры без тела всегда неподвижны;
 *  - на каждый участок один CuboidCollider, на каждый внутренний излом один
 *    CylinderCollider, чтобы на поворотах не оставалось щелей;
 *  - бордюр — один instancedMesh (1 draw call), коллайдеров у него нет.
 *
 * Пример:
 *  <Road points={[[0, 0, 24], [0, 0, 8], [6, 0, -6]]} width={5} />
 */
export default function Road({
  points = [
    [0, 0, 50],
    [0, 0, -20],
  ],
  width = 20,
  thickness = 1,
  position = [0, 0.6, 0],
  color = '#8c8a82',
  seamColor = '#4a4740',
  edgeStones = true,
  colliders = true,
  friction = 0.9,
  restitution = 0.05,
}) {
  const pointsKey = JSON.stringify(points)

  // участки: центр, направление, длина, поворот вокруг Y
  const segments = useMemo(() => {
    const out = []
    for (let i = 0; i < points.length - 1; i++) {
      const [x1, , z1] = points[i]
      const [x2, , z2] = points[i + 1]
      const ddx = x2 - x1
      const ddz = z2 - z1
      const length = Math.hypot(ddx, ddz)
      if (length < 1e-3) continue
      out.push({
        index: i,
        cx: (x1 + x2) / 2,
        cz: (z1 + z2) / 2,
        dx: ddx / length,
        dz: ddz / length,
        length,
        yaw: Math.atan2(ddx, ddz), // локальная ось Z бокса смотрит вдоль дороги
      })
    }
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey])

  const baseTexture = useMemo(() => makeCobbleTexture(color, seamColor), [color, seamColor])

  // отдельная копия текстуры на участок, чтобы у каждого был свой повтор по длине
  const textures = useMemo(
    () =>
      segments.map((seg) => {
        const t = baseTexture.clone()
        t.repeat.set(Math.max(1, width / 1.5), Math.max(1, seg.length / 1.5))
        t.needsUpdate = true
        return t
      }),
    [segments, baseTexture, width]
  )

  const halfT = thickness / 2
  const cy = -halfT // верх полотна на y = 0
  const joints = points.slice(1, -1).map(([x, , z]) => [x, z])

  return (
    <group name="road" position={position}>
      {segments.map((seg, i) => (
        <group key={`s-${i}`}>
          {colliders && (
            <CuboidCollider
              args={[width / 2, halfT, seg.length / 2]}
              position={[seg.cx, cy, seg.cz]}
              rotation={[0, seg.yaw, 0]}
              friction={friction}
              restitution={restitution}
            />
          )}
          <mesh position={[seg.cx, cy, seg.cz]} rotation={[0, seg.yaw, 0]} receiveShadow>
            <boxGeometry args={[width, thickness, seg.length]} />
            <meshStandardMaterial map={textures[i]} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {/* закругление на изломах: заполняет клин, который остаётся между двумя прямоугольниками */}
      {joints.map(([x, z], i) => (
        <group key={`j-${i}`}>
          {colliders && (
            <CylinderCollider
              args={[halfT, width / 2]}
              position={[x, cy, z]}
              friction={friction}
              restitution={restitution}
            />
          )}
          <mesh position={[x, cy, z]} receiveShadow>
            <cylinderGeometry args={[width / 2, width / 2, thickness, 32]} />
            <meshStandardMaterial color={color} roughness={0.95} />
          </mesh>
        </group>
      ))}

      {edgeStones && (
        <EdgeStones segments={segments} width={width} thickness={thickness} color={color} />
      )}
    </group>
  )
}
