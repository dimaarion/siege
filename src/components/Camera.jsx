import {CameraControls, CameraControlsImpl} from "@react-three/drei";
import {useEffect, useRef} from "react";
import {Vector3} from "three";
import {useFrame} from "@react-three/fiber";

export default function Camera(){
    const MAX_PAN_RADIUS = 100; // Максимальное расстояние от центра (0, 0, 0)
    const centerTarget = new Vector3(0, 0, 0); // Центр сцены
    const cameraControlsRef = useRef(null)
    const currentTarget = new Vector3();
    const R = 150;
    const MIN_Y = 20;
    const { ACTION } = CameraControlsImpl;
    const tmp = new Vector3();
    useEffect(() => {
        cameraControlsRef.current?.setLookAt(
            50, 20, -150, // Новая позиция камеры
            0, 20, 100,  // Куда смотрит камера (target)
            true      // Включить плавную анимацию
        ).then((r)=>{
            //  console.log(r)
        });

    }, []);
    const clamp = (e) => {

        const controls = e.target;
        if (!controls) return;
        controls.getTarget(tmp);
        if (tmp.length() > R + 1e-3) {
            tmp.setLength(R);
            controls.setTarget(tmp.x, tmp.y, tmp.z, false);
        }
        controls.getPosition(tmp);
        if (tmp.y < MIN_Y - 1e-3) {
            controls.setPosition(tmp.x, MIN_Y, tmp.z, false);
        }
    };


    return <CameraControls onUpdate={clamp}  mouseButtons={{
        left: ACTION.ROTATE,
        middle: ACTION.DOLLY,
        right: ACTION.TRUCK, // чтобы отключить правую кнопку: ACTION.NONE
        wheel: ACTION.DOLLY,
    }} touches={{
        one: ACTION.TOUCH_ROTATE,
        two: ACTION.TOUCH_DOLLY_TRUCK,
        three: ACTION.TOUCH_DOLLY_TRUCK,
    }}  makeDefault target={[0,0,0]}   enablePan={false} maxPolarAngle={Math.PI / 2 + 0.01} minDistance={5} maxDistance={300} ref={cameraControlsRef} />
}