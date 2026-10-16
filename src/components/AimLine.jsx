import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useGameStore from "../store.js";
import { ammoMass, launchVelocity, materialOf, predictTrajectory } from "../action.js";

const STEPS = 60;

/**
 * Пунктирная линия предполагаемой траектории. Ставьте внутри <Canvas>.
 *
 * originRef — ref на Object3D в корзине (например, basketRef из Catapult).
 *             Направление выстрела берётся из его поворота: ось forward
 *             (в вашей катапульте ядро летит в сторону +Z) проецируется на горизонталь.
 * offset    — смещение точки старта относительно корзины
 * radius    — радиус ядра для расчёта массы, если у ядра нет своего radius
 * groundY   — высота земли, на которой линия обрывается
 * visible   — например, настройка aimLine
 *
 * Линия скрывается, когда идёт выстрел (store.shot !== 0).
 */
export default function AimLine({
    originRef,
    offset = [0, 1.5, 0],
    forward = [0, 0, 1],
    radius = 1,
    groundY = 0,
    color = "#b91c1c",
    visible = true,
}) {
    const line = useMemo(() => {
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute(
            "position",
            new THREE.BufferAttribute(new Float32Array((STEPS + 1) * 3), 3)
        );
        const material = new THREE.LineDashedMaterial({ color, dashSize: 0.5, gapSize: 0.4 });
        const l = new THREE.Line(geometry, material);
        l.frustumCulled = false;
        l.visible = false;
        return l;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        line.material.color.set(color);
    }, [line, color]);

    useEffect(
        () => () => {
            line.geometry.dispose();
            line.material.dispose();
        },
        [line]
    );

    const tmp = useMemo(
        () => ({
            pos: new THREE.Vector3(),
            quat: new THREE.Quaternion(),
            dir: new THREE.Vector3(),
        }),
        []
    );

    useFrame(() => {
        const obj = originRef?.current;
        const { shot, force, slant, pule, puleStep } = useGameStore.getState();

        if (!visible || !obj || shot !== 0 || pule.length === 0) {
            line.visible = false;
            return;
        }

        obj.getWorldPosition(tmp.pos);
        obj.getWorldQuaternion(tmp.quat);
        tmp.dir.set(forward[0], forward[1], forward[2]).applyQuaternion(tmp.quat);
        tmp.dir.y = 0;
        if (tmp.dir.lengthSq() < 1e-6) {
            line.visible = false;
            return;
        }
        tmp.dir.normalize();

        // Считаем по ядру, которое лежит в корзине (или по первому, если ещё ничего не заряжено)
        const el = pule[Math.max(puleStep - 1, 0)];
        const mass = ammoMass(materialOf(el), el?.radius ?? radius);
        const velocity = launchVelocity({
            force,
            slant,
            mass,
            direction: [tmp.dir.x, tmp.dir.z],
        });
        const origin = [
            tmp.pos.x + offset[0],
            tmp.pos.y + offset[1],
            tmp.pos.z + offset[2],
        ];
        const points = predictTrajectory({ origin, velocity, groundY, steps: STEPS });

        const attr = line.geometry.attributes.position;
        for (let i = 0; i <= STEPS; i++) {
            const p = points[Math.min(i, points.length - 1)];
            attr.setXYZ(i, p[0], p[1], p[2]);
        }
        attr.needsUpdate = true;
        line.computeLineDistances();
        line.visible = true;
    });

    return <primitive object={line} />;
}
