// Страница загрузки игры. Нужен Tailwind CSS.
// <Load progress={42} />  или  <Load onDone={() => setReady(true)} /> (тогда прогресс имитируется)
import { useEffect, useRef, useState } from "react";
import {useProgress} from "@react-three/drei";
import useGameStore from "../../store.js";

// Цикл 3.6 с: башня шатается, зубцы и камни падают, потом башня «отстраивается» заново
const CSS = `
.ld-b{transform-box:fill-box;transform-origin:center;animation:ld-fall 3.6s infinite}
@keyframes ld-fall{
  0%,8%{transform:none;opacity:1}
  10%{transform:translate(0,-2px) rotate(-3deg)}
  12%{transform:translate(0,0) rotate(3deg);animation-timing-function:cubic-bezier(.55,0,1,.5)}
  44%{transform:translate(var(--dx),var(--dy)) rotate(var(--r))}
  50%{transform:translate(calc(var(--dx)*1.12),calc(var(--dy) - 7px)) rotate(calc(var(--r)*1.1))}
  56%,84%{transform:translate(calc(var(--dx)*1.15),var(--dy)) rotate(calc(var(--r)*1.1));opacity:1}
  94%{transform:translate(calc(var(--dx)*1.15),var(--dy)) rotate(calc(var(--r)*1.1));opacity:0}
  95%{transform:none;opacity:0}
  100%{transform:none;opacity:1}
}
@media (prefers-reduced-motion:reduce){.ld-b{animation:none}}
`;

// Падающие детали башни: x, y, ширина, высота, смещение/поворот при падении, задержка
const PIECES = [
  { x: 90, y: 40, w: 12, h: 10, dx: -26, dy: 70, r: -120, d: 0 },
  { x: 106, y: 40, w: 12, h: 10, dx: -8, dy: 70, r: 80, d: 0.15 },
  { x: 122, y: 40, w: 12, h: 10, dx: 14, dy: 70, r: -60, d: 0.3 },
  { x: 138, y: 40, w: 12, h: 10, dx: 30, dy: 70, r: 140, d: 0.45 },
  { x: 92, y: 56, w: 16, h: 10, dx: -22, dy: 54, r: 30, d: 0.6 },
  { x: 132, y: 64, w: 16, h: 10, dx: 24, dy: 46, r: -40, d: 0.8 },
];

export default function Load({ title = "Катапульта", onDone }) {


  const {active, progress} = useProgress()

  useEffect(() => {
    useGameStore.getState().setPage("start")
  }, [active]);


  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-gray-900 px-6 text-gray-50">
      <style>{CSS}</style>
      <svg viewBox="0 0 240 128" className="w-72 max-w-full" aria-hidden="true">
        <rect x="0" y="120" width="240" height="2" className="fill-gray-50/30" />

        {/* Флаг */}
        <line x1="120" y1="40" x2="120" y2="18" className="stroke-gray-50" strokeWidth="2" />
        <path d="M120 18 L136 23 L120 28 Z" className="fill-gray-50" />

        {/* Стена башни */}
        <rect x="90" y="50" width="60" height="70" className="fill-red-700" />
        <path
          d="M90 64H150M90 78H150M90 92H150M90 106H150M105 50V64M135 64V78M105 78V92M135 92V106M105 106V120"
          className="fill-none stroke-gray-900/30"
          strokeWidth="1"
        />
        {/* Провалы на месте выпавших камней */}
        <rect x="92" y="56" width="16" height="10" className="fill-gray-900" />
        <rect x="132" y="64" width="16" height="10" className="fill-gray-900" />
        {/* Окно-бойница и дверь */}
        <rect x="117" y="70" width="6" height="14" rx="3" className="fill-gray-900" />
        <path d="M110 120 V104 a10 10 0 0 1 20 0 V120 Z" className="fill-gray-900" />

        {/* Падающие зубцы и камни */}
        {PIECES.map((p, i) => (
          <rect
            key={i}
            x={p.x}
            y={p.y}
            width={p.w}
            height={p.h}
            className="ld-b fill-red-700 stroke-gray-900"
            strokeWidth="1"
            style={{
              "--dx": `${p.dx}px`,
              "--dy": `${p.dy}px`,
              "--r": `${p.r}deg`,
              animationDelay: `${p.d}s`,
            }}
          />
        ))}
      </svg>

      <h1 className="text-3xl font-extrabold tracking-wide">{title}</h1>

      <div className="w-full max-w-xs">
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-gray-50/15"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div
            className="h-full rounded-full bg-red-700 transition-[width] duration-200 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="mt-3 text-center text-sm font-medium text-gray-50/70">
          {progress < 100 ? `Заряжаем катапульту… ${progress}%` : "Огонь!"}
        </p>
      </div>
    </div>
  );
}
