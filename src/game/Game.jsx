import {Physics, RigidBody} from "@react-three/rapier";
import Catapult from "../components/Catapult.jsx";
import * as THREE from "three";
import {useLoader} from "@react-three/fiber";
import {useEffect, useMemo, useRef} from "react";
import Bridge from "../scenes/Bridge.jsx";
import WoodenTowerGoblin from "../scenes/WoodenTowerGoblin.jsx";
import useGameStore from "../store.js";
import {CameraControls} from "@react-three/drei";
import {Levels} from "../scenes/Levels.jsx";


export default function Game(){
    const loadedScene = useLoader(THREE.ObjectLoader, './json/Scene.json');
    const loadedSceneBridge = useLoader(THREE.ObjectLoader, './json/Bridge.json');
    const shells = useLoader(THREE.ObjectLoader, './json/shells.json');
    const restartKey = useGameStore((state)=>state.restartKey)
    const page = useGameStore((state)=>state.page)

    const cameraControlsRef = useRef(null)
    const ground = useMemo(()=>{
        return loadedScene.children.filter((el)=>el.name === "ground").map((el)=>{
            return el
        })
    },[loadedScene.children])

    const catapult = useMemo(()=>{
        return loadedScene.children.filter((el)=>el.name === "catapult").map((el)=>{
            return {id:el.id,children:el, position:[el.position.x,el.position.y,el.position.z],}
        })
    },[loadedScene.children])



    useEffect(() => {
        cameraControlsRef.current?.setLookAt(
            50, 20, -150, // Новая позиция камеры
            0, 20, 100,  // Куда смотрит камера (target)
            true      // Включить плавную анимацию
        ).then((r)=>{
            //  console.log(r)
        });
    }, []);

    return <group>
        <Physics gravity={[0,-9,0]} paused={page === "victory"} key={restartKey} debug={true} >
            <group>
                {ground.map((el)=><RigidBody key={el.id} type={"fixed"} colliders={"cuboid"}>
                    <primitive  object={el} />
                </RigidBody>)}
                {catapult.map((el)=><Catapult key={el.id} params={el.children} position={el.position} shells={shells} />)}
               <Levels />
            </group>
        </Physics>
        <CameraControls makeDefault target={[0,0,0]}   enablePan={false} maxPolarAngle={Math.PI / 2 + 0.01} minDistance={5} maxDistance={300} ref={cameraControlsRef} />
    </group>
}