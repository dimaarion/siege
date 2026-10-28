import {useRef} from "react";
import {useFrame} from "@react-three/fiber";
import {RigidBody} from "@react-three/rapier";
import * as THREE from "three";
export default function CatapultTest({
                                         position = [0, 0, 0],
                                         rotationY = 0,
                                         launchAngle = 45,
                                         force = 50,
                                         projectileMass = 1,
                                         onFire,
                                     }) {
    const baseRef = useRef();
    const turretRef = useRef();

    // Плавный поворот башни катапульты к целевому углу rotationY
    useFrame(() => {
        if (turretRef.current) {
            turretRef.current.rotation.y = THREE.MathUtils.lerp(
                turretRef.current.rotation.y,
                rotationY,
                0.1
            );
        }
    });

    // Логика выстрела
    const handleShoot = () => {
        if (!onFire) return;

        // 1. Угол наклона в радианы
        const angleRad = THREE.MathUtils.degToRad(launchAngle);
        const currentTurretRotation = turretRef.current
            ? turretRef.current.rotation.y
            : rotationY;

        // 2. Расчет начальной позиции вылета из чаши катапульты
        const launchOffset = new THREE.Vector3(0, 2.2, -1.2);
        launchOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), currentTurretRotation);

        const spawnPosition = [
            position[0] + launchOffset.x,
            position[1] + launchOffset.y,
            position[2] + launchOffset.z,
        ];

        // 3. Вычисление направления и силы импульса
        // Импульс делим на массу снаряда, чтобы регулировать скорость
        const speed = force / projectileMass;

        const impulse = new THREE.Vector3(
            -Math.sin(currentTurretRotation) * Math.cos(angleRad) * speed,
            Math.sin(angleRad) * speed,
            -Math.cos(currentTurretRotation) * Math.cos(angleRad) * speed
        );

        // 4. Передаем объект снаряда родительскому компоненту сцены
        onFire({
            id: Date.now(),
            position: spawnPosition,
            impulse: [impulse.x, impulse.y, impulse.z],
            mass: projectileMass,
        });
    };

    return (
        <group position={position}>
            {/* 1. Неподвижная база (шасси) */}
            <RigidBody type="fixed" colliders="cuboid" ref={baseRef}>
                {/* Деревянный каркас основания */}
                <mesh position={[0, 0.4, 0]}>
                    <boxGeometry args={[2.4, 0.4, 3.2]} />
                    <meshStandardMaterial color="#5c3a21" roughness={0.8} />
                </mesh>

                {/* Колеса */}
                {[-1.3, 1.3].map((x, i) =>
                    [-1.2, 1.2].map((z, j) => (
                        <mesh
                            key={`${i}-${j}`}
                            position={[x, 0.4, z]}
                            rotation={[0, 0, Math.PI / 2]}
                        >
                            <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
                            <meshStandardMaterial color="#2d1e18" />
                        </mesh>
                    ))
                )}
            </RigidBody>

            {/* 2. Поворотная башня */}
            <group ref={turretRef} position={[0, 0.6, 0]}>
                {/* Поворотный механизм/платформа */}
                <mesh position={[0, 0.2, 0]}>
                    <cylinderGeometry args={[0.9, 1, 0.3, 16]} />
                    <meshStandardMaterial color="#3d2616" />
                </mesh>

                {/* Вертикальные стойки для рычага */}
                <mesh position={[-0.7, 1.2, 0]}>
                    <boxGeometry args={[0.2, 1.8, 0.4]} />
                    <meshStandardMaterial color="#5c3a21" />
                </mesh>
                <mesh position={[0.7, 1.2, 0]}>
                    <boxGeometry args={[0.2, 1.8, 0.4]} />
                    <meshStandardMaterial color="#5c3a21" />
                </mesh>

                {/* 3. Ложка / Рычаг катапульты (наклонен под углом launchAngle) */}
                <group
                    position={[0, 1.5, 0]}
                    rotation={[THREE.MathUtils.degToRad(-launchAngle + 30), 0, 0]}
                >
                    {/* Балка */}
                    <mesh position={[0, 0, -1]}>
                        <boxGeometry args={[0.25, 0.25, 2.4]} />
                        <meshStandardMaterial color="#7a4b2a" />
                    </mesh>

                    {/* Чаша для снаряда */}
                    <mesh position={[0, 0.2, -2.1]}>
                        <cylinderGeometry args={[0.4, 0.2, 0.3, 12]} />
                        <meshStandardMaterial color="#4a2e1b" />
                    </mesh>
                </group>

                {/* Кнопка интерактивного выстрела (3D UI прямо на катапульте) */}
                <mesh
                    position={[0, 0.6, 1.2]}
                    onClick={handleShoot}
                    onPointerOver={(e) => (document.body.style.cursor = 'pointer')}
                    onPointerOut={(e) => (document.body.style.cursor = 'auto')}
                >
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshStandardMaterial color="#d63031" emissive="#e17055" />
                </mesh>
            </group>
        </group>
    );
}