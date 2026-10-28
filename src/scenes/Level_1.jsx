import {Barrel, Goblin, Sensor, Tower, Wall} from "../components/Objects.jsx";
import {HED, LEVEL_PROJECTILES} from "../action.js";
import useGameStore from "../store.js";
import Road from "../components/Road.jsx";
import Trees from "../components/Trees.jsx";
import Hedgehog from "../components/Hedgehog.jsx";
import {Ground} from "../components/Ground.jsx";

export default function Level_1({nodes, materials}){
    const level = useGameStore((state)=>state.level)
    const objects = LEVEL_PROJECTILES.find((el)=>el.lev === level)
    return <group>
        <Ground />
        {objects.tower.map((el,i)=><Tower id={i} position={el.position} nodes={nodes} materials={materials} items={el.object} key={el.id + "tower"}/>)}
        {objects.wall.map((el)=><Wall position={el.position} nodes={nodes} materials={materials} items={el.object} key={el.id + "tower"}/>)}
        <Road points={[[0, 0, 220], [0, 0, -220]]} colliders={false} />
        <Trees exclude={[[0, 0, 200], [0, 0, -200]]} height={25} count={80} area={[-300, 300, -300, 300]} seed={10} />
        {HED.map((el,i)=><Hedgehog key={i + "ej"} scale={[4,4,4]} position={el} />)}
        <Sensor position={[0,0,200]} />
        {objects.goblin.map((el)=><Goblin config={el.object} nodes={nodes} key={el.id + "goblin-no-tower"} position={el.position} height={el.height} />)}
        {objects.barrel.map((el)=><Barrel position={el.position} key={el.id + "barrel-no-tower"} height={4} />)}
    </group>
}