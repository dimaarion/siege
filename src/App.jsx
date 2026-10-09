import './App.css'
import {Canvas} from "@react-three/fiber";
import {OrbitControls, Sky} from "@react-three/drei";
import Game from "./game/Game.jsx";
import BottomMenu from "./ui/BottomMenu.jsx";

function App() {


  return (
    <>
      <Canvas shadows  camera={{
        fov: 45, position: [16, 10, 36]
      }}>
          <fog attach="fog" args={['#dff1ff', 100, 350]} />
          <Sky sunPosition={[100, 100, 50]} />
          <ambientLight intensity={0.55} />
          <directionalLight
              position={[20, 30, 15]}
              intensity={2.2}
              castShadow
              shadow-mapSize={[2048, 2048]}
              shadow-camera-left={-30}
              shadow-camera-right={30}
              shadow-camera-top={30}
              shadow-camera-bottom={-30}
          />
            <Game />

           <OrbitControls makeDefault target={[0, 4, 6]} enablePan={false} maxPolarAngle={Math.PI / 2 - 0.05} minDistance={8} maxDistance={70} />
      </Canvas>
        <BottomMenu />
    </>
  )
}

export default App
