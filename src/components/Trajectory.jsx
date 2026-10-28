import {useMemo, useRef, useState} from "react";
import * as THREE from "three";
import {Line} from "@react-three/drei";
import {useFrame} from "@react-three/fiber";
import useGameStore from "../store.js";
import {routable} from "../action.js";

const MAX_POINTS = 60;
const preallocatedPoints = Array.from({ length: MAX_POINTS }, () => new THREE.Vector3(0, 0, 0));
const startPos = new THREE.Vector3();

export default function Trajectory({rotateRef,missileRef,basketRef}){
    const projectLinetRef = useRef(null)
    const [rotateLine, setRotateLine] = useState(0)
    const [mass, setMass] = useState(0)
    const force = useGameStore((state) => state.force);

    useFrame(()=>{
        if(rotateRef.current){
            const towerRotation = useGameStore.getState().towerRotation
            const rotatePl = rotateRef.current.rotation()
            if(towerRotation !== 0){
                setRotateLine(rotatePl.y * 2)
            }
            basketRef.current.getWorldPosition(startPos)
            if(missileRef.current?.userData.mass){
                setMass(missileRef.current?.userData.mass)
            }
        }

    })
    
  const linePoints = useMemo(()=>{
      preallocatedPoints.slice(0, 2)
      const gravity = -10.3;
      startPos.set(0,20,0)
      const towerRotation = rotateLine || 0;
      const speed = 15 + (force / 0.66) * (7.9 - force / 5);
      const pitch = routable(25);
      const yaw = towerRotation;
      const vx = speed * Math.cos(pitch) * Math.sin(yaw);
      const vy = speed * Math.sin(pitch) - mass / 10;
      const vz = speed * Math.cos(pitch) * Math.cos(yaw);
      let activePointsCount = 0;
      const timeStep = 0.1;

      for (let i = 0; i < MAX_POINTS; i++) {
          const t = i * timeStep;
          const x = startPos.x + vx * t;
          const y = startPos.y + vy * t + 0.5 * gravity * t * t;
          const z = startPos.z + vz * t;

          const vec = preallocatedPoints[i];

          if (y <= 0) {
              vec.set(x, 0, z);
              activePointsCount++;
              break;
          }
          vec.set(x, y, z);
          activePointsCount++;
      }

      const safeCount = Math.max(activePointsCount, 2);
     
       return  preallocatedPoints.slice(0, safeCount);
   },[force, mass, rotateLine])

    return <group>
        <group ref={projectLinetRef}>
            <group rotation={[0,0,0]}>
                <Line
                    points={linePoints}
                    color="red"
                    lineWidth={4}
                    dashed={true}
                    opacity={0.9}
                    transparent={true}
                />
            </group>
        </group>
    </group>
}