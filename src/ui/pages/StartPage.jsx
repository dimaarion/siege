import {useEffect, useMemo, useState} from 'react'
import useGameStore from "../../store.js";

/**
 * Стартовая страница игры «Осада» — один экран без прокрутки браузера.
 * Корневой блок fixed inset-0 overflow-hidden, поэтому страница никогда не скроллится.
 * Разделы «Уровни», «Арсенал» и «Правила» — вкладки в нижней панели.
 *
 * Палитра строго из трёх цветов: bg-gray-950 (фон), text-white (текст), bg-red-700 (акцент).
 * Все остальные оттенки — это белый или красный с прозрачностью.
 *
 * Требует Tailwind CSS. Шрифты (Pirata One и Alegreya Sans) подгружаются
 * через @import внутри компонента, отдельно подключать ничего не нужно.
 *
 * Пропсы:
 *  levels   — [{ name, blocks }], по умолчанию 5 уровней игры
 *  progress — { stars: { [индекс уровня]: 0..3 } }, как в сохранении игры
 *  onPlay   — (индекс уровня) => void; вызывается по клику на «Играть» и на карточку уровня
 *  repoUrl  — ссылка на репозиторий в подвале
 *
 * На узких экранах башня скрывается, а в нижней панели карточки прокручиваются
 * по горизонтали внутри самой панели. Прокрутка самой страницы при этом не появляется.
 */

const DEFAULT_LEVELS = [
  { name: 'Деревянный форт', blocks: 33 },
  { name: 'Каменная застава', blocks: 140 },
  { name: 'Мост', blocks: 59 },
  { name: 'Цитадель', blocks: 251 },
  { name: 'Замок на сваях', blocks: 111 },
]

// плотность в г/см³, как в массиве снарядов игры
const AMMO = [
  { name: 'Солома', density: 0.2, text: 'Башню не трогает. Хороша для пристрелки.' },
  { name: 'Дерево', density: 0.7, text: 'Выбивает деревянные опоры, камень лишь царапает.' },
  { name: 'Камень', density: 2.7, text: 'Универсальное ядро: крошит дерево, трескает стены.' },
  { name: 'Чугун', density: 7.2, text: 'Пробивает кладку и сносит угловые башни.' },
  { name: 'Свинец', density: 11.3, text: 'Самый тяжёлый: один удар, и опора не держит.' },
]

const STEPS = [
  { n: '1', title: 'Прицелься', text: 'Выбери угол и силу. Пунктир покажет траекторию.' },
  { n: '2', title: 'Выбери снаряд', text: 'Лёгкий или тяжёлый: материал решает, что рухнет.' },
  { n: '3', title: 'Выстрели', text: 'Найди опору и урони корону за минимум выстрелов.' },
]

const KEYS = [
  ['← → ↑ ↓', 'прицел'],
  ['W / S', 'сила'],
  ['1 2 3', 'снаряд'],
  ['Пробел', 'огонь'],
]

const TABS = [
  ['levels', 'Уровни'],
  ['arsenal', 'Арсенал'],
  ['rules', 'Правила'],
]

const HEAD = "font-['Pirata_One',serif] font-normal tracking-wide"

const FONT_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&family=Pirata+One&display=swap');
@keyframes siege-rise {
  0%   { transform: translate3d(0, 0, 0); opacity: 0; }
  15%  { opacity: 0.8; }
  100% { transform: translate3d(var(--drift), -110vh, 0); opacity: 0; }
}
`

const Star = ({ filled }) => (
  <span aria-hidden="true" className={filled ? 'text-red-700' : 'text-white/20'}>
    ★
  </span>
)

const Lock = () => (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="5" y="11" width="14" height="9" rx="1" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
)

// Силуэт башни и гоблина: рисуется bg-gray-950 поверх красного блока
function TowerArt() {
  return (
    <svg viewBox="0 0 400 480" className="h-full w-full fill-gray-950" role="img" aria-label="Башня с гоблином на вершине">
      <rect x="0" y="440" width="400" height="40" />
      <path d="M130 440V150h-20V120h30V100h30v20h20V100h30v20h20V100h30v20h30v30h-20v290z" />
      <g className="fill-red-700">
        <rect x="190" y="200" width="20" height="50" />
        <rect x="190" y="300" width="20" height="50" />
        <rect x="150" y="380" width="14" height="30" />
        <rect x="236" y="380" width="14" height="30" />
      </g>
      {/* гоблин на крыше */}
      <path d="M186 100v-34h28v34z" />
      <path d="M172 78l14-8v14zM228 78l-14-8v14z" />
      <path d="M180 100v-14h40v14z" />
      <path d="M232 100V60l8 0v40z" />
      <path d="M229 52h14v10h-14z" />
      {/* летящие обломки */}
      <rect x="40" y="170" width="26" height="14" transform="rotate(-18 53 177)" />
      <rect x="70" y="250" width="18" height="18" transform="rotate(22 79 259)" />
      <rect x="320" y="210" width="28" height="14" transform="rotate(14 334 217)" />
      <rect x="350" y="300" width="16" height="16" transform="rotate(-30 358 308)" />
      <rect x="300" y="380" width="22" height="12" transform="rotate(8 311 386)" />
      <rect x="60" y="400" width="30" height="40" />
      <rect x="90" y="420" width="24" height="20" />
    </svg>
  )
}

export default function StartPage({
  levels = DEFAULT_LEVELS,
  progress = { stars: {} },
  repoUrl = '#',
}) {
  const [tab, setTab] = useState('levels')
    const level = useGameStore((state)=>state.level)
  const stars = progress?.stars ?? {}
  const isOpen = (i) => i === 0 || (stars[i - 1] ?? 0) > level




  // с нуля начинаем с первого уровня, дальше продолжаем с последнего открытого
  const hasProgress = Object.values(stars).some((s) => s > 0)

  // искры: фиксированные «случайные» параметры, чтобы страница не прыгала при перерисовке
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: (i * 37 + 11) % 100,
        size: 2 + (i % 3),
        delay: (i * 1.3) % 9,
        duration: 9 + (i % 5) * 2,
        drift: (i % 2 ? 1 : -1) * (20 + (i % 4) * 12),
      })),
    []
  )

  const focus =
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700'

  return (
    <div className="fixed inset-0 flex flex-col overflow-hidden bg-gray-950 font-['Alegreya_Sans',system-ui,sans-serif] text-white">
      <style>{FONT_CSS}</style>

      {/* искры на фоне */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 motion-reduce:hidden">
        {sparks.map((s, i) => (
          <span
            key={i}
            className="absolute bottom-0 rounded-full bg-red-700"
            style={{
              left: `${s.left}%`,
              width: s.size,
              height: s.size,
              '--drift': `${s.drift}px`,
              animation: `siege-rise ${s.duration}s linear ${s.delay}s infinite`,
            }}
          />
        ))}
      </div>

      {/* навигация: те же вкладки, что и в нижней панели */}
      <header className="relative z-10 shrink-0 border-b border-white/10">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <span className={`${HEAD} text-2xl`}>Осада</span>
          <div role="tablist" aria-label="Разделы" className="flex h-full gap-6 text-sm">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`tab-${id}`}
                aria-selected={tab === id}
                aria-controls="panel"
                onClick={() => setTab(id)}
                className={`h-full border-b-2 px-1 transition-colors duration-150 ${focus} ${
                  tab === id ? 'border-red-700 text-white' : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* первый экран: занимает всё свободное место между шапкой и панелью */}
      <main className="relative z-10 mx-auto grid min-h-0 w-full max-w-6xl flex-1 grid-cols-1 grid-rows-[minmax(0,1fr)] items-center gap-6 px-6 py-4 md:grid-cols-2">
        <div>
          <h1 className={`${HEAD} text-[clamp(3.5rem,15vh,9rem)] leading-none`}>Осада</h1>
          <p className="mt-[2vh] max-w-md text-[clamp(1rem,2.6vh,1.35rem)] text-white/60">
            Найди слабое место. Урони корону.
          </p>
          <div className="mt-[4vh] flex flex-wrap gap-3">
            <button
              type="button"
              onPointerDown={() =>{
                  useGameStore.getState().setPage("game")
                  useGameStore.getState().puleLevelStart(level)
              }}
              className={`rounded-sm mb-6 bg-red-700 px-8 py-3 text-lg font-bold transition duration-150 hover:brightness-110 active:scale-95 ${focus}`}
            >
              {hasProgress ? 'Продолжить' : 'Играть'}
            </button>
            <button
              type="button"
              onClick={() => setTab('rules')}
              className={`rounded-sm border mb-6 border-white/40 px-8 py-3 text-lg transition-colors duration-150 hover:border-white ${focus}`}
            >
              Как играть
            </button>
          </div>
        </div>

        <div className="hidden h-full min-h-0 items-center justify-center md:flex">
          <div className="aspect-[5/6] h-full max-w-full rounded-sm bg-red-700 shadow-[0_0_60px_-20px] shadow-red-700/40">
            <TowerArt />
          </div>
        </div>
      </main>

      {/* нижняя панель: высота зависит от высоты экрана, внутри при необходимости своя прокрутка */}
      <section
        id="panel"
        role="tabpanel"
        aria-labelledby={`tab-${tab}`}
        className="relative z-10 shrink-0 border-t border-white/10 bg-gray-950"
      >
        <div className="mx-auto h-[clamp(10.5rem,28vh,14rem)] max-w-6xl overflow-auto px-6 py-4">
          {tab === 'levels' && (
            <ul className="grid h-full min-w-[42rem] grid-cols-5 gap-3">
              {levels.map((lv, i) => {
                const open = isOpen(i)
                const got = stars[i] ?? 0
                return (
                  <li key={lv.name} className="min-h-0">
                    <button
                      type="button"
                      disabled={!open}
                      onClick={() => {
                          useGameStore.getState().puleLevelStart(i + 1)
                          useGameStore.getState().setLevel(i + 1)
                      }}
                      className={`flex h-full w-full flex-col justify-between rounded-sm border bg-white/5 p-3 text-left transition-colors duration-150 ${focus} ${
                        open ? 'border-white/10 hover:border-red-700' : 'cursor-not-allowed border-white/10 opacity-50'
                      }`}
                    >
                      <span className="flex items-start gap-2">
                        <span className={`${HEAD} text-3xl leading-none text-red-700`}>{i + 1}</span>
                        <span className="font-bold leading-tight">{lv.name}</span>
                      </span>
                      <span className="flex items-center justify-between text-sm text-white/60">
                        {open ? (
                          <span className="text-lg tracking-widest" aria-label={`Звёзд: ${got} из 3`}>
                            {[0, 1, 2].map((k) => (
                              <Star key={k} filled={k < got} />
                            ))}
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Lock /> Закрыт
                          </span>
                        )}
                        <span>{lv.blocks} бл.</span>
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}

          {tab === 'arsenal' && (
            <ul className="grid h-full min-w-[42rem] grid-cols-5 gap-3">
              {AMMO.map((a) => (
                <li key={a.name} className="min-h-0 rounded-sm border border-white/10 bg-white/5 p-3">
                  <div className="flex items-baseline justify-between">
                    <h3 className={`${HEAD} text-xl`}>{a.name}</h3>
                    <span className="text-xs text-white/60">{a.density}</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-sm bg-white/10" aria-hidden="true">
                    <div className="h-full rounded-sm bg-red-700" style={{ width: `${(a.density / 11.3) * 100}%` }} />
                  </div>
                  <p className="mt-2 text-sm leading-snug text-white/80">{a.text}</p>
                </li>
              ))}
            </ul>
          )}

          {tab === 'rules' && (
            <div className="flex h-full min-w-[42rem] flex-col justify-between">
              <ol className="grid grid-cols-3 gap-6">
                {STEPS.map((s) => (
                  <li key={s.n} className="flex gap-3">
                    <span className={`${HEAD} text-5xl leading-none text-red-700`}>{s.n}</span>
                    <div>
                      <h3 className="font-bold">{s.title}</h3>
                      <p className="text-sm text-white/60">{s.text}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <ul className="flex flex-wrap gap-x-6 gap-y-2 border-t border-white/10 pt-3 text-sm text-white/60">
                {KEYS.map(([k, label]) => (
                  <li key={k} className="flex items-center gap-2">
                    <kbd className="rounded-sm border border-white/20 px-2 py-0.5 font-sans text-xs text-white">{k}</kbd>
                    {label}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      <footer className="relative z-10 shrink-0 border-t border-white/10">
        <div className="mx-auto flex h-8 max-w-6xl items-center justify-between px-6 text-xs text-white/60">
          <span>Осада, {new Date().getFullYear()}</span>
          <a href={repoUrl} className={`transition-colors duration-150 hover:text-white ${focus}`}>
            Репозиторий
          </a>
        </div>
      </footer>
    </div>
  )
}
