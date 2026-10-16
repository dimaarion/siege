import { useMemo } from "react";
import useGameStore from "../../store.js";
import {LEVEL_PROJECTILES} from "../../action.js";

const KEYFRAMES = `
@keyframes victory-drop {
  0%   { opacity: 0; transform: translateY(-2.5rem) scale(1.7) rotate(-20deg); }
  60%  { opacity: 1; transform: translateY(0) scale(0.9) rotate(4deg); }
  100% { opacity: 1; transform: translateY(0) scale(1) rotate(0); }
}
.victory-star {
  opacity: 0;
  animation: victory-drop 0.6s cubic-bezier(0.2, 0.8, 0.3, 1) forwards;
}
@media (prefers-reduced-motion: reduce) {
  .victory-star { opacity: 1; animation: none; }
}
`;

function Star({ earned, className = "", delay = 0 }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={`${className} ${earned ? "victory-star text-gray-50" : "text-red-900"}`}
      style={earned ? { animationDelay: `${delay}ms` } : undefined}
      fill="currentColor"
    >
      <polygon points="12,2 15,9 22,9.5 16.5,14 18.5,21 12,17 5.5,21 7.5,14 2,9.5 9,9" />
    </svg>
  );
}

export default function Victory({
  score = 0,
  destructionGoal = 70, // порог для третьей звезды
  hasNext = true,
  onNext,
  onRetry,
  onMenu,
}) {
  const level = useGameStore((state)=>state.level)
  const bricks = useGameStore((state)=>state.bricks)
  const fallenBrick = useGameStore((state)=>state.fallenBrick)
  const pule = useGameStore((state)=>state.pule)
  const enemies = useGameStore((state)=>state.enemies)
  const puleStep = useGameStore((state)=>state.puleStep)
  const shotsUsed = pule.length - puleStep
  const shotsTotal = pule.length
  const enemiesDefeated = enemies
  const  enemiesTotal = LEVEL_PROJECTILES.find((el)=>el.lev === level).enemies

  const destruction = useMemo(()=>{
    return (fallenBrick / bricks * 100).toFixed(0) // процент разрушенных объектов, 0–100
  },[bricks, fallenBrick])
  const rows = useMemo(
    () => [
      {
        label: "Все враги побеждены",
        value: `${enemiesDefeated} из ${enemiesTotal}`,
        earned: enemiesTotal > 0 && enemiesDefeated >= enemiesTotal,
      },
      {
        label: "Остался неиспользованный снаряд",
        value: `${shotsUsed} из ${shotsTotal}`,
        earned: shotsUsed !== 0,
      },
      {
        label: `Разрушено не меньше ${destructionGoal}%`,
        value: `${destruction}%`,
        earned: destruction >= destructionGoal,
      },
    ],
    [enemiesDefeated, enemiesTotal, shotsUsed, shotsTotal, destruction, destructionGoal]
  );

  const stars = rows.filter((r) => r.earned).length;

  const focus =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-50";

  return (
    <main className="flex fixed z-50 top-0 right-0 left-0 bottom-0 min-h-screen items-center justify-center bg-gray-900 p-4 text-gray-50">
      <style>{KEYFRAMES}</style>

      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-gray-700">
        <header className="bg-red-700 px-6 pb-8 pt-8 text-center">
          <p className="text-sm text-gray-50/80">Уровень {level}</p>
          <h1 className="mt-1 text-3xl font-bold">Крепость разрушена!</h1>

          <div
            className="mt-6 flex items-end justify-center gap-3"
            role="img"
            aria-label={`Звёзд: ${stars} из 3`}
          >
            <Star earned={stars >= 1} delay={200} className="h-14 w-14" />
            <Star earned={stars >= 2} delay={600} className="h-20 w-20" />
            <Star earned={stars >= 3} delay={1000} className="h-14 w-14" />
          </div>
        </header>

        <div className="bg-gray-900 p-6">
          <div className="flex items-baseline justify-between">
            <span className="text-gray-50/70">Очки</span>
            <span className="text-4xl font-bold tabular-nums">
              {score.toLocaleString("ru-RU")}
            </span>
          </div>

          <ul className="mt-5 divide-y  border-y border-gray-700">
            {rows.map((row) => (
              <li key={row.label} className="flex items-center gap-3 py-3">
                <Star earned={false} className={`h-5 w-5 shrink-0 ${row.earned ? "!text-red-700" : "!text-gray-700"}`} />
                <span className={`flex-1 ${row.earned ? "" : "text-gray-50/50"}`}>
                  {row.label}
                </span>
                <span className="tabular-nums text-gray-50/70">{row.value}</span>
              </li>
            ))}
          </ul>

          <div className="mt-6 flex flex-col gap-3">
            {hasNext && (
              <button
                type="button"
                onPointerDown={()=>{
                  useGameStore.getState().setLevelStep()
                  useGameStore.getState().setPage("game")
                  useGameStore.getState().restartKeyStep()
                  useGameStore.getState().puleStepRestart()
                  useGameStore.getState().setSlant(1)
                  useGameStore.getState().rechargeStop()
                }}
                className={`rounded-lg bg-red-700 px-4 py-3 font-semibold text-gray-50 hover:bg-red-600 ${focus}`}
              >
                Следующий уровень
              </button>
            )}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onRetry}
                className={`rounded-lg border border-gray-600 px-4 py-3 hover:bg-gray-800 ${focus}`}
              >
                Сыграть ещё раз
              </button>
              <button
                type="button"
                onClick={onMenu}
                className={`rounded-lg border border-gray-600 px-4 py-3 hover:bg-gray-800 ${focus}`}
              >
                В меню
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
