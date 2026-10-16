import WoodenTowerGoblin from "./WoodenTowerGoblin.jsx";

export default function Level_1(){
    return <group rotation={[0,Math.PI,0]}>
        <WoodenTowerGoblin blockHeight={2}  floorHeight={30}  position={[0,0,-200]}/>
    </group>
}