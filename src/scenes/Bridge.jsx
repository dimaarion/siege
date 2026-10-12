import {useMemo, useState} from "react";
import {Billboard, Clone} from "@react-three/drei";
import {CuboidCollider, RigidBody} from "@react-three/rapier";
import ExplosiveBarrel from "../components/ExplosiveBarrel.jsx";

export default function Bridge({scene}){
    const sensor = useMemo(()=>{
        return scene.children.filter((el)=>el.name === "sensor").map((el)=>{

            return {
                id: el.id,
                position:[el.position.x,el.position.y,el.position.z],
                args:[100,1,100]
            }
        })
    },[scene.children])

    const barrel = useMemo(()=>{
        return scene.children.filter((el)=>el.name === "barrel").map((el)=>{
          const p = el.geometry.parameters
            return {
                id: el.id,
                pos:[el.position.x,el.position.y,el.position.z],
                height:p.height,
                radius:p.radiusTop
            }
        })
    },[scene.children])
    const [barrels, setBarrels] = useState(barrel);
    const remove = (id) => setBarrels((b) => b.filter((x) => x.id !== id));
return <group>
    {scene.children.filter((el)=>el.name === "tree").map((el)=><Clone key={el.id} object={el} />)}
    {scene.children.filter((el)=>el.name === "road").map((el)=><Clone key={el.id} object={el} />)}
    {scene.children.filter((el)=>el.name === "brick").map((el)=><RigidBody density={0.5} userData={{name:"brick"}} key={el.id} colliders={"cuboid"} type={"dynamic"} ><Clone  object={el} /></RigidBody>)}
    {barrels.map((el)=>
        <ExplosiveBarrel
        key={el.id}
        position={el.pos}
        height={el.height}
        radius={el.radius}
        threshold={0.5}
        blastRadius={10}
        blastForce={100}
        onDone={() => remove(el.id)}
    />)}
    {sensor.map((el)=><RigidBody key={el.id} colliders={"cuboid"} type={"fixed"} >
        <CuboidCollider  position={el.position} args={el.args} sensor={true} />
    </RigidBody>)}
</group>
}