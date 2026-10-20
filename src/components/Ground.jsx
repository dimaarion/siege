import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";

export function Ground({position = [0,0,0], args=[5000,0.5,5000]}){
    return <RigidBody type={"fixed"} colliders={"cuboid"}>
        <Box position={position} args={args}   >
            <meshStandardMaterial color="#62803f" />
        </Box>
    </RigidBody>
}
