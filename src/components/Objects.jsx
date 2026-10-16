import useGameStore from "../store.js";
import {CuboidCollider, RigidBody} from "@react-three/rapier";
import {Instance, Instances} from "@react-three/drei";

export function InstancesObjects({arr, geometry, materials, children = null, ref = null, name = "instance"}) {



    return <group>
        <Instances
            name={name}
            ref={ref}
            limit={arr.length} // Optional: max amount of items (for calculating buffer size)
            range={arr.length} // Optional: draw-range
            geometry={geometry}
            material={materials}
        >

            {children?children:""}
            {arr.map((el) => {
                return <Instance
                    key={el.id}
                    position={el.position}
                    rotation={el.rotation}
                    scale={el.scale}


                />
            })}
        </Instances>
    </group>
}
export function Sensor({position=[0,0,0]}){
     return <RigidBody type={"fixed"} colliders={"cuboid"} position={position} >
        <CuboidCollider onIntersectionEnter={(e)=>{
            if(e.other.rigidBody.userData.name === "brick"){
                useGameStore.getState().setFallenBrick()
            }
            if(e.other.colliderObject.name === "pule"){
                useGameStore.getState().puleCountStep()
            }
        }} name={"sensor"} sensor={true} args={[100,1,100]} />

        <CuboidCollider onIntersectionEnter={(e)=>{
            if(e.other.rigidBody.userData.name === "goblin" && !e.other.rigidBody.userData.active){
                    useGameStore.getState().setEnemies()
                    e.other.rigidBody.userData.active = true
            }
        }} name={"sensor-goblin"} sensor={true} args={[200,15,200]} />
    </RigidBody>
}