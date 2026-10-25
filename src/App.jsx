import './App.css'
import {Canvas} from "@react-three/fiber";
import {Sky} from "@react-three/drei";
import Game from "./game/Game.jsx";
import BottomMenu from "./ui/BottomMenu.jsx";
import TopPanel from "./ui/TopPanel.jsx";
import PausePage from "./ui/pages/PausePage.jsx";
import {Suspense} from "react";
import Load from "./ui/pages/Load.jsx";
import StartPage from "./ui/pages/StartPage.jsx";
import useGameStore from "./store.js";
import Victory from "./ui/pages/Victory.jsx";
import GameOver from "./ui/pages/GameOver.jsx";
import LoadImage from "./ui/LoadImage.jsx";



function App() {
    const page = useGameStore((state)=>state.page)
  return (
    <>
      <Suspense fallback={<Load />} >
      <Canvas style={{zIndex:10}} shadows  camera={{
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
          <LoadImage />
            {page === "game"?<div>
                <TopPanel/>
                <BottomMenu/>
                <PausePage />
            </div>:""}
            {page === "start"?<div className={"fixed z-50 top-0 left-0 right-0"}>
                <StartPage/>
            </div>:""}
            {page === "victory"?<GameOver/>:""}
            {page === "game-over"?<GameOver/>:""}

        </Suspense>
    </>
  )
}

export default App
