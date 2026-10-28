import useGameStore from "../store.js";
import {BallCollider, CuboidCollider, InstancedRigidBodies, RigidBody, useRapier} from "@react-three/rapier";
import {Box, Clone, Cylinder, Instance, Instances, Sphere} from "@react-three/drei";
import {useEffect, useMemo, useRef, useState} from "react";
import {routable} from "../action.js";
import {useSpring,a} from "@react-spring/three";
import * as THREE from "three";
import {useFrame} from "@react-three/fiber";
import {Vector3} from "three";
import EnemyTarget from "../classes/EnemyTarget.js";




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
        <CuboidCollider name={"sensor"} sensor={true} args={[180,2,180]} />
    </RigidBody>
}

export function Goblin({config,nodes, position = [0, 0, 0], height }) {
    const hpRef = useRef(null)
    const rbRef = useRef(null)
    const groupRef = useRef(null)
    const positionRemove = new Vector3(100,1,0)
    useFrame(()=>{
        if(hpRef.current.scale.x <= 0 && groupRef.current.visible){
            groupRef.current.visible = false
            if(rbRef.current){
                rbRef.current.setTranslation(positionRemove)
                useGameStore.getState().setEnemies()
            }

        }
    })

    const goblin = new EnemyTarget(config.hp, config.armor);
    return (
        <group ref={groupRef} position={position}>
            <RigidBody
                ref={rbRef}
                position={[0,0,0]}
                colliders={false}
                type={"dynamic"}
                ccd={true}
                rotation={[0,routable(180),0]}
                enabledRotations={[false,false,false]}
                userData={{name:"goblin",active:false}}
            >
                <Clone object={nodes.goblin} />
                <BallCollider onIntersectionEnter={(e)=>{
                    if(e.other.rigidBody.userData?.name === "pule") {
                        goblin.takeDamage(e.other.rigidBody.userData?.damage)
                            hpRef.current.scale.x = goblin.takeDamage(e.other.rigidBody.userData?.damage)

                    }

                }} sensor={true} position={[0,height / 2,0]} args={[height / 1.5]} />
                <BallCollider  ccd={true} position={[0,height / 2,0]} args={[height / 2]} />
                <group>
                    <Box ref={hpRef} position={[0,height + 1,0]} args={[4,0.5,0.2]}>
                        <meshStandardMaterial color="red" />
                    </Box>
                </group>
            </RigidBody>

        </group>

    )
}


export function Barrel({position=[0,0,0]}){
const {world} = useRapier()
    const expRef = useRef(null)
    const expRbRef = useRef(null)
    const groupRef = useRef(null)
    const expGroupRef = useRef(null)
    const worldPosition = useRef(new THREE.Vector3())
    const positionRemove = new Vector3(50,1,0)
    const [expAnim,expApi] = useSpring(()=>({
         from: {scale: [0, 0, 0]},
         config:{duration:100},
        onRest:()=>{
            expRef.current.visible = false
            groupRef.current.visible = false
            if(expRbRef.current){
                expRbRef.current.setTranslation(positionRemove)
            }


        }
    }),[])

    return<group ref={groupRef} position={position} >
        <RigidBody ref={expRbRef}  restitution={0.1} userData={{active:true}} density={0.6} enabledRotations={[false,false,false]}  type={"dynamic"} colliders={"hull"}>
            <Cylinder  args={[2,2,4]}>
                <meshStandardMaterial color="red" />
            </Cylinder>
            <BallCollider restitution={0.1} onIntersectionEnter={(e)=>{
                if(e.other.rigidBody.userData.name === "pule" && e.target.rigidBody.userData.active){
                    e.target.rigidBody.userData.active = false

                    const positionTarget = e.target.rigidBody.translation()
                    const pos = groupRef.current.getWorldPosition(worldPosition.current)
                    expGroupRef.current.position.x =  positionTarget.x - pos.x
                    expGroupRef.current.position.y =  positionTarget.y - pos.y
                    expGroupRef.current.position.z =  positionTarget.z - pos.z
                    world.bodies.getAll()
                        .filter((el) => el.userData?.name === "brick")
                        .forEach((el) => {
                            const positionOther = el.translation();
                            // 1. Считаем вектор разницы (направление к цели)
                            const dx = positionTarget.x - positionOther.x;
                            const dy = positionTarget.y - positionOther.y;
                            const dz = positionTarget.z - positionOther.z;

                            // 2. Считаем реальное расстояние до цели (с маленькой добавкой 0.1, чтобы не было деления на ноль)
                            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.1;

                            // 3. Инвертируем расстояние (1 / distance): чем меньше distance, тем больше множитель
                            // Базовую силу (например, 100) делим на расстояние
                            const strength = 5000 / distance;

                            // 4. Нормализуем направление (dx / distance) и умножаем на инвертированную силу
                            const forceX = -(dx / distance) * strength;
                            const forceY = -(dy / distance) * strength;
                            const forceZ = -(dz / distance) * strength;

                            el.applyImpulse({ x: forceX, y: forceY, z: forceZ }, true);
                            el.setEnabledRotations(true, true, true, true);
                        });
                    expApi.start({
                        to:{scale:[15,15,15]}
                    })

                }

            }} args={[5]} sensor={true}/>
        </RigidBody>
        <group position={[0,0,0]} ref={expGroupRef}>
            <a.group  scale={expAnim.scale}>
                <Sphere  ref={expRef} args={[0.5]}>
                    <meshStandardMaterial transparent={true} opacity={0.8} color="orange" />
                </Sphere>
            </a.group>
        </group>

    </group>

}

export function Tower({items,nodes,position = [0,5,200], materials, id}){
    const rbRef = useRef(null)
    useEffect(() => {
        rbRef.current.count = 0
    }, []);

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
                config:el.enemiesConfig,
                position: [el.position[0],el.position[1] + 0.5,el.position[2]],
                scale:el.scale,
                type: "dynamic"
            }
        })
    },[items])

    const barrel = useMemo(()=>{
        return items.filter((el)=>el.barrel).map((el,i)=>{
            return {
                key:i + "barrel",
                position: [el.position[0],el.position[1] + 0.5,el.position[2]],
                scale:el.scale,
                height:el.scale[1],
                radius:el.scale[0] / 2,
                type: "dynamic"
            }
        })
    },[items])


    useFrame(() => {
        if (rbRef.current) {
            rbRef.current.forEach((el, index) => {
                if (!el) return;
                const pos = el.translation();
                const initialY = stone_block[index]?.position[1] || 0;

                // Логируем первые несколько кадров или проверяем значения
                // console.log(`Block ${index}: current Y = ${pos.y}, initial Y = ${initialY}`);

                // Сделаем порог чувствительнее: например, падение больше чем на 1 единицу

                if (pos.y < 4 && !el.userData?.isFallen) {
                    if (!el.userData) el.userData = {};
                    el.userData.isFallen = true;

                    console.log(`Блок №${index} засчитан как упавший!`);
                    useGameStore.getState().setFallenBrick(index);
                }
            });
        }
    });


    useEffect(() => {
        console.log(rbRef.current)
        useGameStore.getState().setBricks(rbRef.current.length)
    }, []);


    return <group position={position}>
        <InstancedRigidBodies
            ref={rbRef}
            instances={stone_block}
            colliders="cuboid"
            density={0.2}
            friction={0.8}
            restitution={0.05}
            name={"brick-rig"}
            enabledRotations={[false,false,false]}
            userData={{name:"brick",active:true,count:0}}

            colliderNodes={[ <CuboidCollider   onIntersectionEnter={(e)=>{
                if(e.other.colliderObject.name === "sensor"){

                }
                if(e.other.rigidBody.userData.name === "pule"){
                    rbRef.current.forEach((el)=>{
                        el.setEnabledRotations(true, true, true, true);
                    })
                }
            }} name={"brick"}  density={0.2} sensor={true}  args={[1,1, 1]} />]}
        >
            <instancedMesh   frustumCulled={false} args={[undefined, undefined, stone_block.length]} count={stone_block.length} name={"brick"} >
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#fbe1b9" />
            </instancedMesh>
        </InstancedRigidBodies>
        {enemies.map((el)=><Goblin config={el.config} nodes={nodes} key={el.key} height={5} position={el.position}/>)}
        {barrel.map((el)=><Barrel key={el.key} height={5} position={el.position}/>)}

    </group>
}

export function Wall({items,nodes,position = [0,5,100], materials}) {
    const rbRef = useRef(null)



    const walls = useMemo(()=>{
        return items.blocks.map((el,i)=>{
            return {
                key:el.id,
                position: el.pos,
                scale:el.half,
                type: "dynamic"
            }
        })
    },[items])
    return <group position={position}>
        <InstancedRigidBodies
            ref={rbRef}
            instances={walls}
            colliders="cuboid"
            density={0.2}
            friction={0.8}
            restitution={0.05}
            name={"wall-rig"}
            enabledRotations={[false,false,false]}
            userData={{name:"wall",active:true}}

            colliderNodes={[ <CuboidCollider  onIntersectionEnter={(e)=>{

                if(e.other.rigidBody.userData.name === "pule"){
                    rbRef.current.forEach((el)=>{
                        el.setEnabledRotations(true, true, true, true);
                    })
                }
            }} name={"brick"}  density={0.2} sensor={true}  args={[1,1, 1]} />]}
        >
            <instancedMesh   frustumCulled={false} args={[undefined, undefined, walls.length]} count={walls.length} name={"walls"} >
                <boxGeometry args={[2, 2, 2]} />
                <meshStandardMaterial color="#fbe1b9" />
            </instancedMesh>
        </InstancedRigidBodies>

    </group>
}