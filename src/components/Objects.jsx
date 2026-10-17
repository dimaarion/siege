import useGameStore from "../store.js";
import {BallCollider, CuboidCollider, InstancedRigidBodies, RigidBody} from "@react-three/rapier";
import {Instance, Instances} from "@react-three/drei";
import {useEffect, useMemo, useRef, useState} from "react";
import {GOBLIN_BASE_HEIGHT, GOBLIN_DARK, GOBLIN_SKIN, LEVEL_PROJECTILES, routable} from "../action.js";

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


export function Part({ position, size, color, s, solid = false }) {
    const p = position.map((v) => v * s)
    const sz = size.map((v) => v * s)
    return (
        <>
            <mesh position={p} castShadow>
                <boxGeometry args={sz} />
                <meshStandardMaterial color={color} roughness={0.8} />
            </mesh>
            {solid && (
                <CuboidCollider position={p} args={[sz[0] / 2, sz[1] / 2, sz[2] / 2]} />
            )}
        </>
    )
}

export function Goblin({ position = [0, 0, 0], height }) {
    const s = height / GOBLIN_BASE_HEIGHT
    return (
        <RigidBody
            position={position}
            colliders={false}
            type={"dynamic"}
            rotation={[0,routable(180),0]}
            enabledRotations={[false,true,false]}
            userData={{name:"goblin",active:false}}
        >
            {/* ноги */}
            <Part s={s} solid position={[-0.2, 0.2, 0]} size={[0.25, 0.4, 0.25]} color={GOBLIN_DARK} />
            <Part s={s} solid position={[0.2, 0.2, 0]} size={[0.25, 0.4, 0.25]} color={GOBLIN_DARK} />

            {/* туловище и пояс */}
            <Part s={s} solid position={[0, 0.65, 0]} size={[0.7, 0.5, 0.4]} color={GOBLIN_SKIN} />
            <Part s={s} position={[0, 0.5, 0]} size={[0.74, 0.14, 0.44]} color="#6b4a2b" />

            {/* руки */}
            <Part s={s} solid position={[-0.46, 0.65, 0]} size={[0.18, 0.45, 0.18]} color={GOBLIN_SKIN} />
            <Part s={s} solid position={[0.46, 0.65, 0]} size={[0.18, 0.45, 0.18]} color={GOBLIN_SKIN} />

            {/* дубинка в правой руке */}
            <Part s={s} position={[0.5, 1.0, 0.1]} size={[0.14, 0.5, 0.14]} color="#7a5230" />
            <Part s={s} position={[0.5, 1.3, 0.1]} size={[0.22, 0.2, 0.22]} color="#7a5230" />

            {/* голова */}
            <Part s={s} solid position={[0, 1.15, 0]} size={[0.6, 0.5, 0.5]} color={GOBLIN_SKIN} />

            {/* острые уши */}
            <Part s={s} position={[-0.48, 1.25, 0]} size={[0.36, 0.12, 0.1]} color={GOBLIN_SKIN} />
            <Part s={s} position={[0.48, 1.25, 0]} size={[0.36, 0.12, 0.1]} color={GOBLIN_SKIN} />

            {/* нос */}
            <Part s={s} position={[0, 1.1, 0.3]} size={[0.12, 0.14, 0.14]} color={GOBLIN_DARK} />

            {/* глаза */}
            <Part s={s} position={[-0.15, 1.24, 0.26]} size={[0.14, 0.14, 0.04]} color="#f5f5dc" />
            <Part s={s} position={[0.15, 1.24, 0.26]} size={[0.14, 0.14, 0.04]} color="#f5f5dc" />
            <Part s={s} position={[-0.15, 1.24, 0.29]} size={[0.06, 0.06, 0.03]} color="#111" />
            <Part s={s} position={[0.15, 1.24, 0.29]} size={[0.06, 0.06, 0.03]} color="#111" />

            {/* рот и зубы */}
            <Part s={s} position={[0, 0.98, 0.26]} size={[0.3, 0.07, 0.04]} color="#2a1a14" />
            <Part s={s} position={[-0.1, 1.02, 0.28]} size={[0.05, 0.06, 0.03]} color="#fffbe6" />
            <Part s={s} position={[0.1, 1.02, 0.28]} size={[0.05, 0.06, 0.03]} color="#fffbe6" />
            <BallCollider position={[0,height / 2,0]} args={[height / 2]} />
        </RigidBody>
    )
}


export function Tower({items}){
    const [start,setStart] =useState(false)
    const rbRef = useRef(null)
    const stone_block = useMemo(()=>{
        return items.map((el,i)=>{
            return {
                key:i + "stone_block",
                position: el.position,
                scale:el.scale,
                type: "dynamic"
            }
        })
    },[items])

    const enemies = useMemo(()=>{
        return items.filter((el)=>el.enemies).map((el,i)=>{
            return {
                key:i + "enemies",
                position: [el.position[0],el.position[1] + 0.5,el.position[2]],
                scale:el.scale,
                type: "fixed"
            }
        })
    },[items])


    useEffect(() => {

    }, []);
console.log(enemies)

    return <group position={[0,5,200]}>
        <InstancedRigidBodies
            ref={rbRef}
            instances={stone_block}
            colliders="cuboid"
            density={0.2}
            friction={0.8}
            restitution={0.05}
            name={"brick-rig"}
            enabledRotations={[false,false,false]}
            userData={{name:"brick",active:true}}
            onIntersectionEnter={(e)=>{
                if(e.other.rigidBody.userData.name === "pule"){
                    rbRef.current.forEach((el)=>{
                         el.setEnabledRotations(true, true, true, true);
                    })
                }
            }}
            colliderNodes={[ <CuboidCollider density={0.2} sensor={true}  args={[1,1, 1]} />]}
        >
            <instancedMesh   frustumCulled={false} args={[undefined, undefined, stone_block.length]} count={stone_block.length} name={"brick"} >
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#fbe1b9" />
            </instancedMesh>
        </InstancedRigidBodies>
        {enemies.map((el)=><Goblin  height={5} position={el.position}/>)}
    </group>
}