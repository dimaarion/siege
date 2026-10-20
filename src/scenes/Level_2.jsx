import WoodenTowerGoblin from "./WoodenTowerGoblin.jsx";

export default function Level_2({nodes, materials}){
    return <group rotation={[0,Math.PI,0]}>
        <WoodenTowerGoblin blockHeight={2}  floorHeight={30}  position={[20,0,-200]}/>
        <WoodenTowerGoblin blockHeight={2}  floorHeight={30}  position={[-20,0,-200]}/>
    </group>
}