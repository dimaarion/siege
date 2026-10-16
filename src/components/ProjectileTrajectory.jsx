import {useEffect, useMemo, useRef, useState} from "react";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import {routable} from "../action.js";

export function ProjectileTrajectory({
                                         origin = [0, 1, 0],
                                         velocity = 20,
                                         pit = 45, // угол вверх
                                         grav = 2,
                                         segments = 100,
                                         flightTime = 5,
                                         color = "orange",
                                         missileRef,
                                         recharge,
                                         rotatePlatformRef
                                     }) {

    
    const [mass,setMass] = useState(0)
    const [yaw,setYaw] = useState(0)
    const ref = useRef(null)

    useFrame(()=>{
        if(ref.current && rotatePlatformRef.current){
            const position = rotatePlatformRef.current.translation()
            ref.current.rotation.y = rotatePlatformRef.current.rotation().y * 2
            ref.current.position.z = position.z
            ref.current.position.x = position.x - 0.8
            ref.current.position.y = position.y + 16
        }
    })

  useEffect(() => {
      if(!missileRef.current)return
        setMass(missileRef.current.userData.mass)
    }, [missileRef, velocity,recharge]);

    const vel = useMemo(()=>{
        console.log(velocity * 10 + 10)
        return  velocity * 2 + 20 + mass
    },[mass, velocity])

    const gravity = useMemo(()=>{
        return grav + mass
    },[grav, mass])
   
    const pitch = useMemo(()=>{
        return ((30 + mass / 10) - pit * 10).toFixed(5)
    },[mass, pit])

    const points = useMemo(() => {
        const pts = [];

        const pitchRad = THREE.MathUtils.degToRad(parseFloat(pitch));
        const yawRad = 0;

        const direction = new THREE.Vector3(
            Math.sin(yawRad) * Math.cos(pitchRad),
            Math.sin(pitchRad),
            Math.cos(yawRad) * Math.cos(pitchRad)
        ).normalize();

        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * flightTime;

            const x = origin[0] + direction.x * vel * t;
            const z = origin[2] + direction.z * vel * t;
            const y =
                origin[1] +
                direction.y * vel * t -
                0.5 * gravity * t * t;

            if (y < 0) break;

            pts.push(new THREE.Vector3(x, y, z));
        }

        return pts;
    }, [origin, vel, pitch, gravity, segments, flightTime]);

    return (
        <group ref={ref} rotation={[0,0,0]}>
            <Line
                points={points}
                color={color}
                lineWidth={2}
            />
        </group>

    );
}