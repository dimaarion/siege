import { useEffect } from "react";
import useGameStore from "../store.js";
import { ammoMass, getAmmo, materialOf } from "../action.js";

// Панель выбора ядра. Это обычный DOM-компонент: ставьте его рядом с остальным
// интерфейсом (например, рядом с TopPanel), а не внутри <Canvas>.
// Показывает ещё не заряженные ядра. Нажатие на кнопку или клавиша 1–9
// делает выбранное ядро следующим для зарядки.
export default function AmmoSelector({ radius = 1 }) {
    const pule = useGameStore((state) => state.pule);
    const puleStep = useGameStore((state) => state.puleStep);

    const remaining = pule
        .map((el, index) => ({ el, index }))
        .filter(({ index }) => index >= puleStep);

    useEffect(() => {
        const choose = (index) =>
            useGameStore.getState().puleChoose(index);

        const onKey = (e) => {
            const n = Number(e.key);
            if (!n) return;
            const item = remaining[n - 1];
            if (item) choose(item.index);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [pule, puleStep]);

    if (remaining.length === 0) return null;

    const choose = (index) =>
        useGameStore.getState().puleChoose(index);

    return (
        <div className="fixed bottom-25 w-35 h-50 xl:h-1/2 right-4 overflow-y-auto flex-wrap gap-2 rounded-xl border border-gray-700 bg-gray-900/90 p-2">
            {remaining.map(({ el, index }, i) => {
                const ammo = getAmmo(materialOf(el));
                const next = i === 0;
                return (
                    <button
                        key={`${index}-${ammo.key}`}
                        type="button"
                        onClick={() => choose(index)}
                        aria-pressed={next}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-left text-sm text-gray-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-50 ${
                            next ? "border-red-700 bg-red-700" : "border-gray-700 hover:bg-gray-800"
                        }`}
                    >
                        <span
                            className="h-5 w-5 shrink-0 rounded-full border border-gray-50/30"
                            style={{ background: ammo.visual.color }}
                        />
                        <span>
                            <span className="block font-semibold">{ammo.label}</span>
                            <span className="block text-xs text-gray-50/70">
                                {ammoMass(ammo.key, radius).toFixed(1)} кг · {i + 1}
                            </span>
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
