import {Physics} from "@react-three/rapier";
import Catapult from "../components/Catapult.jsx";
import * as THREE from "three";
import {useLoader} from "@react-three/fiber";
import {useMemo} from "react";
import useGameStore from "../store.js";
import {useAnimations, useGLTF} from "@react-three/drei";
import {Levels} from "../scenes/Levels.jsx";
import Camera from "../components/Camera.jsx";
import {Ground} from "../components/Ground.jsx";


export default function Game(){
    const loadedScene = useLoader(THREE.ObjectLoader, './json/Scene.json');
    const shells = useLoader(THREE.ObjectLoader, './json/shells.json');
    const {nodes, materials, animations} = useGLTF("./model/scene.glb")
    const {ref, actions} = useAnimations(animations);

    const restartKey = useGameStore((state)=>state.restartKey)
    const page = useGameStore((state)=>state.page)


    const catapult = useMemo(()=>{
        return loadedScene.children.filter((el)=>el.name === "catapult").map((el)=>{
            return {id:el.id,children:el, position:[el.position.x,el.position.y,el.position.z],}
        })
    },[loadedScene.children])

    return <group ref={ref}>
        <Physics gravity={[0,-10,0]} paused={page === "victory"} key={restartKey} debug={true} >
            <group>
                <Ground />
                {catapult.map((el)=><Catapult key={el.id} params={el.children} position={el.position} shells={shells} />)}
               <Levels nodes={nodes} materials={materials} />
            </group>
        </Physics>
        <Camera/>
    </group>
}