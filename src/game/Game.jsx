import {Physics, RigidBody} from "@react-three/rapier";
import Catapult from "../components/Catapult.jsx";
import * as THREE from "three";
import {useLoader} from "@react-three/fiber";
import {useMemo} from "react";
import Bridge from "../scenes/Bridge.jsx";
import WoodenTowerGoblin from "../scenes/WoodenTowerGoblin.jsx";


export default function Game(){
    const loadedScene = useLoader(THREE.ObjectLoader, './json/Scene.json');
    const loadedSceneBridge = useLoader(THREE.ObjectLoader, './json/Bridge.json');
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

    return <>
        <Physics debug={true} >
            <group>
                {ground.map((el)=><RigidBody key={el.id} type={"fixed"} colliders={"cuboid"}>
                    <primitive  object={el} />
                </RigidBody>)}
                {catapult.map((el)=><Catapult key={el.id} params={el.children} position={el.position} />)}
           {/* <Bridge scene={loadedSceneBridge} />*/}
                <group rotation={[0,Math.PI,0]}>
                    <WoodenTowerGoblin floorHeight={30}  position={[0,0,-200]} />
                </group>

            </group>

        </Physics>
    </>
}