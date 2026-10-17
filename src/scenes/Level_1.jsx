import {Tower} from "../components/Objects.jsx";
import {LEVEL_PROJECTILES} from "../action.js";
import useGameStore from "../store.js";
import Road from "../components/Road.jsx";
import Trees from "../components/Trees.jsx";

export default function Level_1(){
    const level = useGameStore((state)=>state.level)
    const objects = LEVEL_PROJECTILES.find((el)=>el.lev === level)
    return <group>
        {objects.tower.map((el)=><Tower items={el.object} key={el.id + "tower"}/>)}
        <Road points={[[0, 0, 220], [0, 0, -220]]} colliders={false} />
        <Trees exclude={[[0, 0, 200], [0, 0, -200]]} height={25} count={80} area={[-300, 300, -300, 300]} seed={10} />
    </group>
}