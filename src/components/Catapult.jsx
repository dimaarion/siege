import {useEffect, useMemo, useRef} from "react";
import Wheel from "./Wheel.jsx";
import {RigidBody, useFixedJoint, useRapier, useRevoluteJoint} from "@react-three/rapier";
import {Box, Shape, Sphere} from "@react-three/drei";
import useGameStore from "../store.js";
import * as THREE from "three";
import {Vector3} from "three";

export function Jointmissile({beamRef, missileRef}){
   useFixedJoint(beamRef, missileRef, [
        // Position of the joint in bodyA's local space
        [0, 0.5, -8],
        // Orientation of the joint in bodyA's local space
        [0, 0, 0, 1],
        // Position of the joint in bodyB's local space
        [0, 0, 0],
        // Orientation of the joint in bodyB's local space
        [0, 0, 0, 1]
    ]);
   return null
}

export default function Catapult({params,position = [0,0,0]}){

    const wheel_1Ref = useRef(null);
    const wheel_2Ref = useRef(null);
    const wheel_3Ref = useRef(null);
    const wheel_4Ref = useRef(null);
    const rotatePlatformRef = useRef(null);
    const beamRef = useRef(null)
    const basketRef = useRef(null)
    const towerRotation = useGameStore((state)=>state.towerRotation)
    const shot = useGameStore((state)=>state.shot)
    const recharge = useGameStore((state)=>state.recharge)
    const missileRef = useRef(null);
    const worldPosition = useRef(new THREE.Vector3())


    const platformRef = useRef(null);

    const wheel_1 = useMemo(()=>{
        return params.children.filter((el)=>el.name === "wheel_1");
    },[params])

    const wheel_2 = useMemo(()=>{
        return params.children.filter((el)=>el.name === "wheel_2");
    },[params])

    const wheel_3 = useMemo(()=>{
        return params.children.filter((el)=>el.name === "wheel_3");
    },[params])

    const wheel_4 = useMemo(()=>{
        return params.children.filter((el)=>el.name === "wheel_4");
    },[params])

    const platform = useMemo(()=>{
        return params.children.filter((el)=>el.name === "platform");
    },[params])

    const rotatePlatform = useMemo(()=>{
        return params.children.filter((el)=>el.name === "rotate-platform");
    },[params])

    const post = useMemo(()=>{
        return params.children.filter((el)=>el.name === "post");
    },[params])

    const beam = useMemo(()=>{
        return params.children.filter((el)=>el.name === "beam");
    },[params])

  const joint_1 =  useRevoluteJoint(platformRef, wheel_1Ref, [
        // Position of the joint in bodyA's local space
        [0, 0, -4],
        // Position of the joint in bodyB's local space
        [4, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [1,0, 0]
    ]);

    const joint_2 =  useRevoluteJoint(platformRef, wheel_2Ref, [
        // Position of the joint in bodyA's local space
        [0, 0, -4],
        // Position of the joint in bodyB's local space
        [-4, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [1, 0, 0]
    ]);

    const joint_3 =   useRevoluteJoint(platformRef, wheel_3Ref, [
        // Position of the joint in bodyA's local space
        [0, 0, 4],
        // Position of the joint in bodyB's local space
        [-4, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [1, 0, 0]
    ]);
    const joint_4 =   useRevoluteJoint(platformRef, wheel_4Ref, [
        // Position of the joint in bodyA's local space
        [0, 0, 4],
        // Position of the joint in bodyB's local space
        [4, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [1, 0, 0]
    ]);

    const joint_rotatePlatform =   useRevoluteJoint(platformRef, rotatePlatformRef, [
        // Position of the joint in bodyA's local space
        [0, 0, -5],
        // Position of the joint in bodyB's local space
        [0, 0, 0],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [0, 1, 0]
    ]);
    const joint_beam =   useRevoluteJoint(rotatePlatformRef, beamRef, [
        // Position of the joint in bodyA's local space
        [0, 8, 0],
        // Position of the joint in bodyB's local space
        [0, 0, 2],
        // Axis of the joint, expressed in the local-space of
        // the rigid-bodies it is attached to. Cannot be [0,0,0].
        [1, 0, 0]
    ]);







    useEffect(() => {
        if (joint_1.current) {
            joint_1.current.configureMotorVelocity(0.0, 0.1)
        }
    }, [joint_1])

    useEffect(() => {
        if (joint_2.current) {
            joint_2.current.configureMotorVelocity(0.0, 0.1)
        }
    }, [joint_2])

    useEffect(() => {
        if (joint_3.current) {
            joint_3.current.configureMotorVelocity(0.0, 0.1)
        }
    }, [joint_3])

    useEffect(() => {
        if (joint_4.current) {
            joint_4.current.configureMotorVelocity(0.0, 0.1)
        }
    }, [joint_4])

    useEffect(() => {
        if (joint_rotatePlatform.current) {
            joint_rotatePlatform.current.configureMotorVelocity(towerRotation * 10, 0.1)
            joint_rotatePlatform.current.setLimits(-Math.PI / 4, Math.PI / 4)
        }
    }, [joint_rotatePlatform, towerRotation])

    useEffect(() => {
        if (joint_beam.current) {
            joint_beam.current.configureMotorVelocity(shot, 2)
            joint_beam.current.setLimits(-Math.PI / 4, Math.PI / 2)

        }
    }, [joint_beam, shot])

    useEffect(() => {
        if(basketRef.current){
            basketRef.current.getWorldPosition(worldPosition.current)
            missileRef.current.setTranslation(new Vector3(worldPosition.current.x,worldPosition.current.y + 0.5,worldPosition.current.z))
            missileRef.current.setLinvel({x:0,y:0,z:0},true)
            joint_beam.current.setLimits(-Math.PI / 4, Math.PI / 2)
            console.log(missileRef.current)
        }
    }, [joint_beam, missileRef,recharge]);





const t = false


    return <group position={position}>
        {!recharge && shot === 0 && t? <Jointmissile beamRef={beamRef} missileRef={missileRef} />:""}
        <RigidBody ref={wheel_1Ref} type={"dynamic"} colliders={"hull"}>
            <group position={[0,0,0]}>
                 {wheel_1.map((el)=><Wheel key={el.id} element={el} />)}
            </group>
        </RigidBody>

        <RigidBody ref={wheel_2Ref} type={"dynamic"} colliders={"hull"}>
            <group position={[0,0,0]}>
                {wheel_2.map((el)=><Wheel key={el.id} element={el} />)}
            </group>
        </RigidBody>

        <RigidBody  ref={wheel_3Ref} type={"dynamic"} colliders={"hull"}>
            <group position={[0,0,0]}>
                {wheel_3.map((el)=><Wheel key={el.id} element={el} />)}
            </group>
        </RigidBody>

        <RigidBody  ref={wheel_4Ref} type={"dynamic"} colliders={"hull"}>
            <group position={[0,0,0]}>
                {wheel_4.map((el)=><Wheel key={el.id} element={el} />)}
            </group>
        </RigidBody>

        <RigidBody  ref={rotatePlatformRef} type={"dynamic"} colliders={"hull"}>
            <group position={[0,-2,0]}>
                {rotatePlatform.map((el)=><primitive key={el.id} object={el} />)}
                <group>
                    {post.map((el)=><primitive key={el.id} object={el} />)}
                </group>
            </group>
        </RigidBody>


        <RigidBody ref={beamRef} type={"dynamic"} colliders={"cuboid"}>
            <group>
                {beam.map((el)=><primitive key={el.id} object={el} />)}
                <group ref={basketRef} position={[0,0,-8]}>
                    <Box args={[3,0.5,3]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box position={[0,0.5,-1.7]} args={[3,1.5,0.5]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box position={[0,0.5,1.7]} args={[3,1.5,0.5]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box position={[1.7,0.5,0]} args={[0.5,1.5,4]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>
                    <Box position={[-1.7,0.5,0]} args={[0.5,1.5,4]}>
                        <meshStandardMaterial color="#fbe1b9" />
                    </Box>

                </group>
            </group>
        </RigidBody>
        <RigidBody enabledRotations={[false,false,false]}  ref={platformRef} type={"fixed"} colliders={"cuboid"}>
            <group position={[0,-2,0]}>
                {platform.map((el)=><primitive key={el.id} object={el} />)}
            </group>
        </RigidBody>

        <RigidBody ref={missileRef} type={"dynamic"} colliders={"ball"}>
            <Sphere args={[1]} position={[0, 1, 0]}>
                <meshStandardMaterial color="#fbe1b9"/>
            </Sphere>
        </RigidBody>
    </group>
}