import './App.css'
import {Canvas} from "@react-three/fiber";
import {OrbitControls, Sky} from "@react-three/drei";
import Game from "./game/Game.jsx";
import BottomMenu from "./ui/BottomMenu.jsx";
import TopPanel from "./ui/TopPanel.jsx";

function App() {


  return (
    <>
      <Canvas shadows  camera={{
        fov: 30, position: [16, 50, -100],
      }}>
          <fog attach="fog" args={['#dff1ff', 200, 500]} />
          <Sky sunPosition={[100, 100, 50]} />
          <ambientLight intensity={1} />
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


      </Canvas>
        <TopPanel />
        <BottomMenu />
    </>
  )
}

export default App
