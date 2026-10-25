import {useEffect, useMemo, useRef, useState} from 'react';
import * as THREE from 'three';
import { Line } from '@react-three/drei';
import {useFrame} from "@react-three/fiber";
import {routable} from "../action.js";

export function TrajectoryPreview({
                                      force,          // Сила (начальная скорость)
                                      angleDeg,       // Угол наклона в градусах (0-90)
                                      gravity = -9, // Гравитация (должна совпадать с настройками Physics)
                                      pointsCount = 50, // Четкость линии (кол-во точек)
                                      direction = [0, 0, 1], // Базовое направление ствола (вперед по -Z)
                                      missileRef,
                                      recharge,
                                      rotatePlatformRef
}) {

    const ref = useRef(null)
    // Расчет точек траектории оптимизирован через useMemo

    useFrame(()=>{
        if(ref.current && rotatePlatformRef.current){
            const position = rotatePlatformRef.current.translation()
            ref.current.rotation.y = rotatePlatformRef.current.rotation().y * 2
            ref.current.rotation.x = routable(-10)
            ref.current.position.z = position.z
            ref.current.position.x = position.x
            ref.current.position.y = position.y
        }
    })
    const [mass,setMass] = useState(0)

    useEffect(() => {
        if(!missileRef.current)return
        setMass(missileRef.current.userData.mass)
    }, [missileRef, force,recharge]);

    const points = useMemo(() => {
        // 1. Переводим угол в радианы
        const angleRad = -THREE.MathUtils.degToRad(10 + angleDeg * 20)

        // 2. Рассчитываем векторы скорости
        const vY = force * Math.sin(angleRad);
        const vForward =  10 + (force * Math.cos(angleRad)) * 5;

        // Вектор начальной горизонтальной скорости (берем базовое направление и умножаем)
        const forwardVec = new THREE.Vector3(...direction).normalize().multiplyScalar(vForward);

        const initialVelocity = new THREE.Vector3(forwardVec.x, vY, forwardVec.z);
        const initialPosition = new THREE.Vector3(-0.5, 19, 0); // Высота ствола (0, 1, 0)

        const trajectoryPoints = [];
        const timeStep = 0.1; // Шаг времени для расчета каждой точки (сек)

        // 3. Расчет точек по формулам баллистики: P(t) = P0 + V0*t + 0.5*A*t^2
        for (let i = 0; i < pointsCount; i++) {
            const t = i * timeStep; // Текущее время в симуляции

            const currentPoint = new THREE.Vector3(
                initialPosition.x + initialVelocity.x * t,
                initialPosition.y + initialVelocity.y * t + 0.5 * (gravity - mass / 4) * t * t,
                initialPosition.z + initialVelocity.z * t
            );

            trajectoryPoints.push(currentPoint);

            // Прерываем расчет, если линия ушла под землю (упрощенно y < 0)
            if (currentPoint.y < 0) break;
        }

        return trajectoryPoints;
    }, [angleDeg, force, direction, pointsCount, gravity, mass]);

    return (
        // Группа, чтобы позиция траектории была привязана к пушке
        <group ref={ref}>
            <Line
                points={points}       // Массив рассчитанных точек
                color="red"       // Желтый/золотой цвет линии
                lineWidth={5}         // Толщина линии
                dashed={true}        // Пунктир (можно поставить true)
                opacity={1}         // Прозрачность
                transparent={true}
            />
        </group>
    );
}