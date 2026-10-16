import useGameStore from "../store.js";
import Level_1 from "./Level_1.jsx";
import Level_2 from "./Level_2.jsx";

export function Levels(){
    const level = useGameStore((state)=>state.level)
    switch (level) {
        case 1:
            return <Level_1 />
        case 2:
            return <Level_2 />
        default:
            return <Level_1 />
    }
}