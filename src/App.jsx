import './App.css'
import {Canvas} from "@react-three/fiber";
import {CameraControls, OrbitControls, Sky} from "@react-three/drei";
import Game from "./game/Game.jsx";
import BottomMenu from "./ui/BottomMenu.jsx";
import TopPanel from "./ui/TopPanel.jsx";
import {useEffect, useRef} from "react";
import StartMenu from "./ui/pages/StartMenu.jsx";
import StartPage from "./ui/pages/StartPage.jsx";
import PausePage from "./ui/pages/PausePage.jsx";

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
        <div className={"fixed z-50 top-0 left-0 right-0"}>
            {/*<StartPage />*/}
            <PausePage  open={true} />
        </div>

    </>
  )
}

export default App
