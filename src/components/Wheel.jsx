import {Clone} from "@react-three/drei";


export default function Wheel({element}) {
    return <Clone position={[0,0,0]} object={element} />
}