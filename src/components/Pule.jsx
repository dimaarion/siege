import { useEffect, useState } from "react";
import useGameStore from "../store.js";
import { materialOf } from "../action.js";
import Cannonball from "./Cannonballs.jsx";

// Радиус прежней чёрной сферы-заглушки. Ядра катапульты большие: корзина 3×3.
const SHELL_RADIUS = 1;

export default function Pule({ missileRef }) {
    const pule = useGameStore((state) => state.pule);
    const puleStep = useGameStore((state) => state.puleStep);
    const shot = useGameStore((state) => state.shot);

    // Сколько ядер уже «заряжено» (могут ломаться). Ядро в корзине не ломается,
    // пока не начался выстрел (shot > 0). После этого оно остаётся заряженным
    // навсегда, даже когда рычаг вернулся и shot снова стал 0.
    const [armedCount, setArmedCount] = useState(0);
    const loadedCount = Math.min(puleStep, pule.length);

    useEffect(() => {
        if (shot > 0) (()=>setArmedCount(loadedCount))();
    }, [shot, loadedCount]);

    useEffect(() => {
        if (puleStep === 0) (()=>setArmedCount(0))();
    }, [puleStep]);

    if (pule.length < puleStep) return null;

    const loaded = pule.filter((el, i) => i < puleStep);
    return loaded.map((el, i) => (
        <Cannonball
            key={`${el?.id ?? el}pule${i}`}
            type={materialOf(el)}
            radius={el?.radius ?? SHELL_RADIUS}
            damage={el.damage}
            armed={i < armedCount}
            // ref нужен только последнему ядру, которое лежит в корзине,
            // иначе все ядра перезаписывают друг друга в missileRef
            ref={i === loaded.length - 1 ? missileRef : undefined}
        />
    ));
}
