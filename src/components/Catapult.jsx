import {useEffect, useMemo, useRef, useState} from "react";
import Wheel from "./Wheel.jsx";
import {CuboidCollider, RigidBody, useFixedJoint, useRevoluteJoint} from "@react-three/rapier";
import {Box, Clone, Cylinder} from "@react-three/drei";
import useGameStore from "../store.js";
import * as THREE from "three";
import {Vector3} from "three";
import Pule from "./Pule.jsx";
import {TrajectoryPreview} from "./TrajectoryPreview.jsx";
import {useFrame} from "@react-three/fiber";


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
        [0, 12, slant],
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


    const stopRef = useRef(null)
    const towerRotation = useGameStore((state)=>state.towerRotation)
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



    const joint_rotatePlatform =   useRevoluteJoint(platformRef, rotatePlatformRef, [
        // Position of the joint in bodyA's local space
        [0, 0, 0],
        // Position of the joint in bodyB's local space
        [0, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [0, 1, 0]
    ]);


    useEffect(() => {
        useGameStore.getState().setSlant(0)
console.log(nodes)
    }, [nodes]);

    useEffect(() => {
        const time = setTimeout(()=>{
            rotatePlatformRef.current.setEnabledRotations(true, true, true, true);
        },500)
        return ()=>clearTimeout(time)
          }, []);





    useEffect(() => {
        if (joint_rotatePlatform.current) {
            joint_rotatePlatform.current.configureMotorVelocity(towerRotation, towerRotation === 0?1000:0.5)
            joint_rotatePlatform.current.setLimits(-Math.PI / 4, Math.PI / 4)
       if(towerRotation !== 0){

          // beamRef.current.setEnabledRotations(true, true, true, true);
       }

        }
    }, [joint_rotatePlatform, towerRotation])



    useEffect(() => {
        if (movement !== 0){
         //   platformRef.current.setBodyType(0, true);
        }else {
        //    platformRef.current.setBodyType(1, true);
        }
    }, [movement]);

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

                    //      beamRef.current.setEnabledRotations(true, true, true, true);
                }
             }
        }
        if(shot !== 0){
           // beamRef.current.setEnabledRotations(true, true, true, true);
        }
        }, [pule.length, puleStep, recharge, shot]);



    useFrame(()=>{
        if(platformRef.current){
            const pos = platformRef.current.translation()

            // console.log(movement === 1 && pos.z < 5)
            if((movement === 1 && pos.z < 40) || (movement === -1 && pos.z > -40)){
                wheelRef.current.children.forEach((el)=>{
                    el.rotation.x += movement / 10
                })
                platformRef.current.setLinvel({
                    x:0,y:0,z:movement * 4
                })
            }else {
                platformRef.current.setLinvel({
                    x:0,y:0,z:0
                })
            }

        }

    })


    return <group position={position}>

        {recharge && shot === 0 && pule.length + 1 > puleStep? <Jointmissile beamRef={beamRef} missileRef={missileRef} />:""}
        <JointBeam key={slant} recharge={recharge} beamRef={beamRef} rotatePlatformRef={rotatePlatformRef} slant={slant} stopRef={stopRef} />

        <RigidBody enabledRotations={[false,false,false]}  ref={rotatePlatformRef} type={"dynamic"} colliders={"hull"}>
            <group position={[0,3,0]} >
                <group>
                    <Cylinder args={[3.5,3.5,2]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Cylinder>
                </group>
                <group position={[1,5,1]}>
                    <Box args={[0.5,10,3]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                </group>
                <group position={[-1,5,1]}>
                    <Box args={[0.5,10,3]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                </group>

            </group>
        </RigidBody>


        <RigidBody   userData={{name:"beam"}}  ref={beamRef} type={"dynamic"} colliders={"cuboid"}>
            <group>
                <group>
                  <Box args={[1,0.5,20]}>
                      <meshStandardMaterial color="#fbe1b9" />
                  </Box>
                </group>

                <group  ref={basketRef} position={[0,0,-8]}>
                    <Box  args={[3,0.5,3]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box  position={[0,1.2,-1.7]} args={[3,3,0.5]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box  position={[0,0.5,1.7]} args={[3,1.5,0.5]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box  position={[1.7,0.5,0]} args={[0.5,1.5,4]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box  position={[-1.7,0.5,0]} args={[0.5,1.5,4]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                 <CuboidCollider position={[0,1.5,0]} onIntersectionExit={()=>{
                     useGameStore.getState().shotMin()
                     useGameStore.getState().rechargeStop()
                 }} sensor={true} args={[2,2,2]}/>
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
    <TrajectoryPreview angleDeg={slant} force={force} rotatePlatformRef={rotatePlatformRef} recharge={recharge} missileRef={missileRef}   />
    </group>
}