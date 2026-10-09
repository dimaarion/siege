import {RigidBody} from "@react-three/rapier";
import {Box} from "@react-three/drei";

export function Ground({params}){
    return <RigidBody type={"fixed"} colliders={"cuboid"}>
        <Box position={params.position} args={params.args}   >
            <meshStandardMaterial color="#62803f" />
        </Box>
    </RigidBody>
}
