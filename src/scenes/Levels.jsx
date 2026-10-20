import useGameStore from "../store.js";
import Level_1 from "./Level_1.jsx";
import Level_2 from "./Level_2.jsx";

export function Levels({nodes, materials}){
    const level = useGameStore((state)=>state.level)
    switch (level) {
        case 1:
            return <Level_1 nodes={nodes} materials={materials} />
        case 2:
            return <Level_2 nodes={nodes} materials={materials} />
        default:
            return <Level_1 nodes={nodes} materials={materials} />
    }
}