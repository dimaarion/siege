import {useEffect, useRef} from "react";
import Wheel from "./Wheel.jsx";
import {CuboidCollider, RigidBody, useFixedJoint, useRevoluteJoint} from "@react-three/rapier";
import useGameStore from "../store.js";
import * as THREE from "three";
import {Vector3} from "three";
import Pule from "./Pule.jsx";
import {useFrame} from "@react-three/fiber";
import {routable} from "../action.js";
import {Box, Line} from "@react-three/drei";
import Trajectory from "./Trajectory.jsx";

export function Jointmissile({beamRef, missileRef}){

   useFixedJoint(beamRef, missileRef, [
        // Position of the joint in bodyA's local space
        [0, 1.8, -8],
        // Orientation of the joint in bodyA's local space
        [0, 0, 0, 1],
        // Position of the joint in bodyB's local space
        [0, 0, 0],
        // Orientation of the joint in bodyB's local space
        [0, 0, 0, 1]
    ]);
   return null
}

export function JointBeam({rotatePlatformRef, beamRef,slant,stopRef,recharge}){
    const force = useGameStore((state)=>state.force)
    const shot = useGameStore((state)=>state.shot)

    const joint_beam =   useRevoluteJoint(rotatePlatformRef, beamRef, [
        // Position of the joint in bodyA's local space
        [0, 12, 0],
        // Position of the joint in bodyB's local space
        [0, 0, 1],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [1, 0, 0]
    ]);
    useEffect(() => {
        if (joint_beam.current && stopRef.current === null) {
            let v = shot
            if(!recharge){
                v = -5
            }
            joint_beam.current.configureMotorVelocity(v, force)
            joint_beam.current.setLimits(-Math.PI / 4, Math.PI / 2)

        }

    }, [force, joint_beam, recharge, shot, stopRef])
    return null
}

export default function Catapult({params,position = [0,0,0],shells, nodes, material}){


    const wheelRef = useRef(null);
    const rotatePlatformRef = useRef(null);
    const beamRef = useRef(null)
    const basketRef = useRef(null)
    const basketMoelRef = useRef(null)
    const basketRigRef = useRef(null)
    const blockRef = useRef(null)
    const projectRef = useRef(null)
    const projectSightRef = useRef(null)


    const stopRef = useRef(null)

    const shot = useGameStore((state)=>state.shot)
    const slant = useGameStore((state)=>state.slant)
    const recharge = useGameStore((state)=>state.recharge)
    const movement = useGameStore((state)=>state.movement)
    const pule = useGameStore((state)=>state.pule)
    const puleStep = useGameStore((state)=>state.puleStep)
    const force = useGameStore((state) => state.force);

    const missileRef = useRef(null);
    const worldPosition = useRef(new THREE.Vector3())
    const platformRef = useRef(null);






    const joint_beam =   useRevoluteJoint(rotatePlatformRef, beamRef, [
        // Position of the joint in bodyA's local space
        [0, 12, 0],
        // Position of the joint in bodyB's local space
        [0, 0, 1],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [1, 0, 0]
    ]);
    useEffect(() => {
        if (joint_beam.current && stopRef.current === null) {
            let v = shot
            if(!recharge){
                v = -5
            }
            joint_beam.current.configureMotorVelocity(v, force)
            joint_beam.current.setLimits(-Math.PI / 4, Math.PI / 2)

        }

    }, [force, joint_beam, recharge, shot, stopRef])




    useEffect(() => {

console.log(nodes)
    }, [nodes]);

    useEffect(() => {
        const time = setTimeout(()=>{
            rotatePlatformRef.current.setEnabledRotations(true, true, true, true);
        },500)
        return ()=>clearTimeout(time)
          }, []);



    useFixedJoint(beamRef, basketMoelRef, [
        // Position of the joint in bodyA's local space
        [0, 0, 0],
        // Orientation of the joint in bodyA's local space
        [0, 0, 0, 1],
        // Position of the joint in bodyB's local space
        [0, 0, 0],
        // Orientation of the joint in bodyB's local space
        [0, 0, 0, 1]
    ]);


    useEffect(() => {
        if(recharge){
            if(basketRef.current){
                if(pule.length + 1 === puleStep){
                    stopRef.current = true
                }

                if(pule.length + 1 > puleStep && !stopRef.current){
                    const position = basketRef.current.getWorldPosition(worldPosition.current)
                    missileRef?.current?.setTranslation(new Vector3(position.x,position.y + 1.5,position.z - 1))
                    missileRef?.current?.setEnabledRotations(true, true, true, true);
                }
             }
        }

        }, [pule.length, puleStep, recharge, shot]);


    useFrame(()=>{
        if(platformRef.current){
            const pos = platformRef.current.translation()
            if((movement === 1 && pos.z < 40) || (movement === -1 && pos.z > -40)){
                wheelRef.current.children.forEach((el)=>{
                    el.rotation.x += movement / 10
                })
                platformRef.current.setLinvel({
                    x:0,y:0,z:movement * 4
                },true)
                rotatePlatformRef.current.setLinvel({
                    x:0,y:0,z:movement * 4
                },true)
            }else {
                platformRef.current.setLinvel({
                    x:0,y:0,z:0
                },true)
                rotatePlatformRef.current.setLinvel({
                    x:0,y:0,z:0
                },true)
            }
            if(missileRef.current && projectSightRef.current){
                const mass = missileRef.current?.userData.mass?missileRef.current?.userData.mass:1
                projectSightRef.current.position.z = force  * (70 - mass / 4)

            }
            if(rotatePlatformRef.current){
                const towerRotation = useGameStore.getState().towerRotation
                rotatePlatformRef.current.setAngvel({x:0,y:towerRotation,z:0},true)
            }
            if(projectRef.current){
                const pos = rotatePlatformRef.current.translation()
                const rotateBas = rotatePlatformRef.current.rotation()
                projectRef.current.rotation.y = rotateBas.y * 2
                projectRef.current.position.x = pos.x
                projectRef.current.position.z = pos.z

            }
        }
    })




    return <group position={position}>

        {recharge && shot === 0 && pule.length + 1 > puleStep? <Jointmissile beamRef={beamRef} missileRef={missileRef} />:""}
        <JointBeam  recharge={recharge} beamRef={beamRef} rotatePlatformRef={rotatePlatformRef} slant={0} stopRef={stopRef} />

        <RigidBody  enabledRotations={[false,false,false]}  ref={rotatePlatformRef} type={"kinematicVelocity"} colliders={"hull"}>
            <group position={[0,2,0]} >
                <group>
                    <primitive position={[0,0,0]} object={nodes.platform_rotate} />
                </group>
                <group position={[1.5,6,0]}>
                    <primitive position={[0,0,0]} object={nodes.desk_right} />
                </group>
                <group position={[-1.5,6,0]}>
                    <primitive position={[0,0,0]} object={nodes.desk_left} />
                </group>
                <CuboidCollider ref={blockRef}  position={[0,3,2.5]} args={[2,1,1.5]} />
            </group>
        </RigidBody>


        <RigidBody position={[0,8,0]} rotation={[-routable(30),0,0]}    userData={{name:"beam"}}  ref={beamRef} type={"dynamic"} colliders={"cuboid"}>
            <group >
                <group>
                    <primitive position={[0,0,0]} object={nodes.beam} />
                </group>

                <group  ref={basketRef} position={[0,0,-8]}>
                    <CuboidCollider args={[3,0,3]}/>
                    <CuboidCollider position={[0,1.2,-1.7]} args={[3,3,0.5]}/>
                    <CuboidCollider  position={[0,0.5,1.7]} args={[3,1.5,0.5]}/>
                    <CuboidCollider  position={[1.7,0.5,0]} args={[0.5,1.5,4]}/>
                    <CuboidCollider position={[-1.7,0.5,0]} args={[0.5,1.5,4]}/>

                 <CuboidCollider ref={basketRigRef} position={[0,1.5,0]} onIntersectionExit={()=>{
                     useGameStore.getState().shotMin()
                     useGameStore.getState().rechargeStop()
                 }} sensor={true} args={[2,2,2]}/>
                </group>
            </group>
        </RigidBody>
        <RigidBody ref={basketMoelRef} type={"dynamic"} sensor={true}>
            <group scale={0.8} >
                <group position={[0,3,-10]}>
                    <primitive position={[0,0,0]} object={nodes.basket} />
                </group>
            </group>
        </RigidBody>


        <RigidBody enabledRotations={[false,false,false]}  ref={platformRef} type={"kinematicVelocity"} colliders={"cuboid"}>
            <group position={[0,0,0]}>
                <primitive position={[0,0,0]} object={nodes.platform_1} />
            </group>
            <group ref={wheelRef}>
                <group position={[5.5,0,4]} >
                    <Wheel  element={nodes.wheel_1} />
                </group>
                <group position={[-5.5,0,4]} >
                    <Wheel  element={nodes.wheel_1} />
                </group>
                <group position={[5.5,0,-4]} >
                    <Wheel  element={nodes.wheel_1} />
                </group>
                <group position={[-5.5,0,-4]} >
                    <Wheel  element={nodes.wheel_1} />
                </group>
            </group>

        </RigidBody>

    <Pule missileRef={missileRef} shells={shells} />
        <group ref={projectRef} position={[0,0,0]} >
            <group ref={projectSightRef} >
                <group rotation={[0,routable(45),0]}>
                    <Box position={[0,-2.2,0]} args={[8,0.2,2]}>
                        <meshStandardMaterial color="red" />
                    </Box>
                    <Box position={[0,-2.2,0]} args={[2,0.2,8]}>
                        <meshStandardMaterial color="red" />
                    </Box>
                </group>

            </group>
        </group>







     <Trajectory basketRef={basketRef} rotateRef={rotatePlatformRef} missileRef={missileRef} />

    {/*<TrajectoryPreview  force={force} rotatePlatformRef={rotatePlatformRef} recharge={recharge} missileRef={missileRef}   />*/}
    </group>
}