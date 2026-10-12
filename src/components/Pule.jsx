import {BallCollider, RigidBody} from "@react-three/rapier";
import {Sphere} from "@react-three/drei";
import useGameStore from "../store.js";
import ExplodingProjectile from "./ExplodingProjectile.jsx";
import {useState} from "react";

export default function Pule({missileRef}){
    const pule = useGameStore((state) => state.pule)
    const puleStep = useGameStore((state) => state.puleStep)
    const [explode, setExplode] = useState(false)


    if(pule.length < puleStep)return null
    return pule.filter((el)=>el < puleStep).map((el)=><RigidBody  enabledRotations={[false,false,false]}  key={el + "pule"}  ref={missileRef} type={"dynamic"} colliders={"ball"}>
            <Sphere  position={[0,0,0]} args={[1]}>
                <meshStandardMaterial color="#000000"/>
            </Sphere>
           <BallCollider onIntersectionEnter={(e)=>{
               if(e.other.rigidBody.userData.name === "brick"){
                   useGameStore.getState().scopeStep()
               }
           }} sensor={true} args={[1]} />
        </RigidBody>)
}