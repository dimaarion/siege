import {BallCollider, RigidBody} from "@react-three/rapier";
import {Clone, Sphere} from "@react-three/drei";
import useGameStore from "../store.js";
import {useEffect, useMemo, useState} from "react";


function Shell({obj, name}){
    const o = useMemo(()=>{
        return obj.children.find((f)=>f.name === name)
    },[name, obj.children])
    if(o){
        return <Clone position={[0,0,0]} object={o} />
    }else{
      return  <Sphere  position={[0,0,0]} args={[1]}>
            <meshStandardMaterial color="#000000"/>
        </Sphere>
    }
}

export default function Pule({missileRef,shells}){
    const pule = useGameStore((state) => state.pule)
    const puleStep = useGameStore((state) => state.puleStep)

    if(pule.length < puleStep)return null
    return pule.filter((el,i)=>i < puleStep).map((el)=><RigidBody  enabledRotations={[false,false,false]}  key={el.id + "pule"}  ref={missileRef} type={"dynamic"} colliders={"ball"}>
            {/*<Sphere  position={[0,0,0]} args={[1]}>
                <meshStandardMaterial color="#000000"/>
            </Sphere>*/}
       <Shell obj={shells} name={el.name} />

           <BallCollider onIntersectionEnter={(e)=>{
               if(e.other.rigidBody.userData.name === "goblin"){
                   useGameStore.getState().scopeStep()
               }
           }} sensor={true} args={[1]} />
        </RigidBody>)
}