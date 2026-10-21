// Страница загрузки игры. Нужен Tailwind CSS.
// <Load progress={42} />  или  <Load onDone={() => setReady(true)} /> (тогда прогресс имитируется)
import { useEffect, useRef, useState } from "react";
import {useProgress} from "@react-three/drei";
import useGameStore from "../../store.js";

export default function Load({ title = "Катапульта", onDone }) {


  const {active, progress} = useProgress()
  const [config,setConfig] = useState({
      position:window.screen.orientation.angle === 0?280:0,width:window.screen.orientation.angle === 0?450:1013
  })

  useEffect(() => {
      if(active){
          useGameStore.getState().setPage("start")
      }

  }, [active]);

    useEffect(() => {

        window.addEventListener("orientationchange", (e) => {
            setConfig({
                position:e.target.screen.orientation.angle === 0?280:0,width:e.target.screen.orientation.angle === 0?450:1013
            })

        })
    }, []);


    return  <div className={"fixed m-auto left-0 right-0 top-0 bottom-0 bg-gray-800 z-50"}>
        <svg width={"100%"} height={"100%"} viewBox={"0 0 1920 1080"} preserveAspectRatio="xMidYMid slice">
            <image  x={0} y={0} height={"100%"} width={"100%"}  href={"./img/start-page-alb.png"} />
            <g transform={'translate(-200 200)'}>
                <image  x={"50%"}  y={0}  width={400}  href={"./img/title.png"} />
            </g>

            <g transform={'translate(454 698)'}>
                <rect x={config.position} y={0} width={config.width} height={60} rx={30} fill={"#15161C"} stroke={"#646870"} strokeWidth={5} />
                <rect x={config.position} y={0} width={config.width / 100 * progress} height={60} rx={30} fill={"#C30404"}   />
            </g>
            <image x={712} y={484} width={497} height={112} href={"./img/load-text.png"} />
        </svg>
            </div>



}
