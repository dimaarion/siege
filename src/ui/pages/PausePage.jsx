import { useCallback, useEffect, useRef, useState } from 'react'
import {DEFAULT_SETTINGS} from "../../action.js";
import useGameStore from "../../store.js";

/**
 * Страница паузы с настройками для «Осады». Заменяет PauseMenu: в этом файле
 * есть всё сразу (хуки usePause и useSettings и сам компонент).
 * Стиль как у StartPage: bg-gray-950, text-white, bg-red-700. Требует Tailwind CSS.
 *
 * Экран один и не скроллится: слева название и кнопки, справа панель настроек
 * с тремя вкладками (Звук, Графика, Управление). Прокрутка есть только внутри
 * панели настроек и только если контент не помещается.
 *
 * Пропсы:
 *  open      — показывать ли страницу
 *  settings  — объект настроек (из useSettings)
 *  onChange  — (patch) => void, например onChange({ master: 50 })
 *  onReset   — сбросить настройки к значениям по умолчанию
 *  onResume, onRestart, onMenu — действия кнопок
 *  title     — название уровня (необязательно)
 *  stats     — строка под названием, например "Выстрелов: 2 из 3" (необязательно)
 *
 * Подключение:
 *   const [paused, setPaused] = usePause()
 *   const [settings, update, reset] = useSettings()
 *
 *   <Physics paused={paused}> ... </Physics>
 *   <PausePage open={paused} settings={settings} onChange={update} onReset={reset}
 *              onResume={() => setPaused(false)} onRestart={...} onMenu={...} />
 *
 * Как применять настройки в игре (сама страница ничего в сцене не меняет):
 *   master, music, effects (0..100) — громкость: gain = master/100 * effects/100 в вашем аудио-движке;
 *   shadows: 'off' | 'low' | 'high' — <Canvas shadows={settings.shadows !== 'off'}> и
 *            shadow-mapSize={settings.shadows === 'high' ? [2048, 2048] : [1024, 1024]} у света;
 *   fps (bool)        — показывать счётчик кадров (например, <Stats /> из drei);
 *   sensitivity       — скорость камеры: rotateSpeed = 0.2 + (sensitivity / 100) * 1.6
 *                       (при значении 50 получается 1.0, как по умолчанию в OrbitControls);
 *   aimLine (bool)    — рисовать ли пунктирную линию прицела.
 *
 * Не забудьте приостановить и собственные таймеры игры (например, ожидание 9 секунд
 * после последнего выстрела), иначе уровень может проиграться во время паузы.
 */


const STORAGE_KEY = 'siege-settings-v1'
const clamp = (v, a, b) => Math.min(b, Math.max(a, v))

// приводим сохранённое к допустимым значениям, чтобы мусор в localStorage ничего не сломал
function sanitize(raw) {
  const d = DEFAULT_SETTINGS
  const num = (k) => (typeof raw?.[k] === 'number' ? clamp(raw[k], 0, 100) : d[k])
  const bool = (k) => (typeof raw?.[k] === 'boolean' ? raw[k] : d[k])
  return {
    master: num('master'),
    music: num('music'),
    effects: num('effects'),
    shadows: ['off', 'low', 'high'].includes(raw?.shadows) ? raw.shadows : d.shadows,
    fps: bool('fps'),
    sensitivity: num('sensitivity'),
    aimLine: bool('aimLine'),
  }
}

/** Настройки с сохранением в localStorage. Возвращает [settings, update(patch), reset()]. */
export function useSettings() {
  const [settings, setSettings] = useState(() => {
    try {
      return sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY)))
    } catch {
      return DEFAULT_SETTINGS
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
    } catch {
      /* localStorage может быть недоступен */
    }
  }, [settings])

  const update = useCallback((patch) => setSettings((s) => sanitize({ ...s, ...patch })), [])
  const reset = useCallback(() => setSettings(DEFAULT_SETTINGS), [])
  return [settings, update, reset]
}

/**
 * Состояние паузы: [paused, setPaused]. Esc включает паузу, а потеря фокуса окном
 * или уход со вкладки ставят её сами (отключается через { autoPause: false }).
 * Закрывает паузу сама страница по Esc или кнопкой «Продолжить».
 */
export function usePause({ autoPause = true } = {}) {
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape' && !e.repeat) setPaused(true)
    }
    const onHide = () => autoPause && setPaused(true)
    const onVisibility = () => document.hidden && onHide()
    window.addEventListener('keydown', onKey)
    window.addEventListener('blur', onHide)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('blur', onHide)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [autoPause])

  return [paused, setPaused]
}

const HEAD = "font-['Pirata_One',serif] font-normal tracking-wide"
const FONT_CSS = "@import url('https://fonts.googleapis.com/css2?family=Alegreya+Sans:wght@400;500;700&family=Pirata+One&display=swap');"
const focus = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700'

const TABS = [
  ['sound', 'Звук']
]

const KEYS = [
  ['← → ↑ ↓', 'прицел'],
  ['W / S', 'сила'],
  ['1 2 3', 'снаряд'],
  ['Пробел', 'огонь'],
  ['R', 'заново'],
  ['Esc', 'пауза'],
]

/* ---------- элементы формы ---------- */

function Row({ id, label, hint, children }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/10 py-3 last:border-0">
      <div className="min-w-0">
        <label htmlFor={id} className="block font-bold">
          {label}
        </label>
        {hint && <span className="block text-sm text-white/60">{hint}</span>}
      </div>
      {children}
    </div>
  )
}

function Slider({ id, label, hint, value, onChange}) {
  return (
    <Row id={id} label={label} hint={hint}>
      <div className="flex shrink-0 items-center gap-3">
        <input
          id={id}
          type="range"
          min={0}
          max={100}
          step={1}
          value={value}
          onChange={(e) => onChange(+e.target.value)}
          className={`h-1.5 w-32 cursor-pointer accent-red-700 sm:w-48 ${focus}`}
        />
        <span className="w-10 text-right tabular-nums text-white/60">{value}%</span>
      </div>
    </Row>
  )
}

function Toggle({ id, label, hint, checked, onChange = ()=>{} }) {
  return (
    <Row id={id} label={label} hint={hint}>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors duration-150 ${focus} ${
          checked ? 'bg-red-700' : 'bg-white/20'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-150 ${
            checked ? 'translate-x-5' : ''
          }`}
        />
      </button>
    </Row>
  )
}

function Segmented({ id, label, hint, value, options, onChange = ()=>{} }) {
  return (
    <Row id={id} label={label} hint={hint}>
      <div id={id} role="radiogroup" aria-label={label} className="flex shrink-0 overflow-hidden rounded-sm border border-white/20">
        {options.map(([val, text]) => (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={value === val}
            onClick={() => onChange(val)}
            className={`px-3 py-1.5 text-sm transition-colors duration-150 ${focus} ${
              value === val ? 'bg-red-700 font-bold' : 'text-white/80 hover:bg-white/10'
            }`}
          >
            {text}
          </button>
        ))}
      </div>
    </Row>
  )
}

/* ---------- страница ---------- */

export default function PausePage({ open, onReset = ()=>{} , onResume = ()=>{} , onRestart = ()=>{}, onMenu = ()=>{} , title, stats }) {
  const [tab, setTab] = useState('sound')
  const rootRef = useRef(null)
  const resumeRef = useRef(null)
  const master = useGameStore((state)=>state.master)
  const music = useGameStore((state)=>state.music)
  const effects = useGameStore((state)=>state.effects)
  if (!open) return null
  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
      className="fixed inset-0 z-50 overflow-hidden bg-gray-950/95 font-['Alegreya_Sans',system-ui,sans-serif] text-white backdrop-blur-[2px]"
    >
      <style>{FONT_CSS}</style>

      <div className="mx-auto grid h-full w-full max-w-5xl grid-cols-1 grid-rows-[auto_minmax(0,1fr)] gap-6 px-6 py-6 md:grid-cols-[18rem_minmax(0,1fr)] md:grid-rows-[minmax(0,1fr)] md:gap-10 md:py-10">
        {/* слева: название и действия */}
        <div className="flex flex-col md:justify-between">
          <div>
            <h2 id="pause-title" className={`${HEAD} text-[clamp(2.75rem,10vh,5rem)] leading-none`}>
              Пауза
            </h2>
            {(title || stats) && (
              <p className="mt-2 text-white/60">
                {title && <span className="block font-bold text-white">{title}</span>}
                {stats && <span className="block">{stats}</span>}
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 md:mt-0 md:flex md:flex-col md:gap-3">
            <button
              ref={resumeRef}
              type="button"
              onClick={onResume}
              className={`rounded-sm bg-red-700 px-4 py-3 text-lg font-bold transition duration-150 hover:brightness-110 active:scale-95 ${focus}`}
            >
              Продолжить
            </button>
            <button
              type="button"
              onClick={onRestart}
              className={`rounded-sm border border-white/40 px-4 py-3 text-lg transition-colors duration-150 hover:border-white ${focus}`}
            >
              Заново
            </button>
            <button
              type="button"
              onClick={onMenu}
              className={`rounded-sm border border-white/40 px-4 py-3 text-lg transition-colors duration-150 hover:border-white ${focus}`}
            >
              В меню
            </button>
          </div>

          <p className="hidden text-sm text-white/60 md:block">
            <kbd className="rounded-sm border border-white/20 px-2 py-0.5 font-sans text-xs text-white">Esc</kbd> продолжить
          </p>
        </div>

        {/* справа: настройки */}
        <section className="flex min-h-0 flex-col rounded-sm border border-white/10 bg-white/5">
          <div role="tablist" aria-label="Настройки"  className="flex shrink-0 gap-6 border-b border-white/10 px-5">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                role="tab"
                id={`set-tab-${id}`}
                aria-selected={tab === id}
                aria-controls="set-panel"
                tabIndex={tab === id ? 0 : -1}
                onClick={() => setTab(id)}
                className={`-mb-px border-b-2 py-3 transition-colors duration-150 ${focus} ${
                  tab === id ? 'border-red-700 text-white' : 'border-transparent text-white/60 hover:text-white'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div id="set-panel" role="tabpanel" aria-labelledby={`set-tab-${tab}`} className="min-h-0 flex-1 overflow-auto px-5">
            {tab === 'sound' && (
              <>
                <Slider id="s-master" label="Общая громкость" value={master} onChange={useGameStore.getState().setMaster} />
                <Slider id="s-music" label="Музыка" value={music} onChange={useGameStore.getState().setMusic} />
                <Slider id="s-effects" label="Эффекты" hint="Удары, взрывы, обвалы" value={effects} onChange={useGameStore.getState().setEffects} />
              </>
            )}
          </div>

          <div className="flex shrink-0 justify-end border-t border-white/10 px-5 py-3">
            <button
              type="button"
              onClick={onReset}
              className={`rounded-sm border border-white/40 px-4 py-1.5 text-sm transition-colors duration-150 hover:border-white ${focus}`}
            >
              Сбросить настройки
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
