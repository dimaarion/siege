import {useMemo, useState} from 'react'
import useGameStore from "../../store.js";
import {useSpring,animated} from "@react-spring/web";



export default function StartPage(){
    const direct = [{transform:'rotate(5deg)'},{transform:'rotate(-5deg)'},{transform:'rotate(5deg)'},{transform:'rotate(0deg)'}]
    const [play,apiPlay] = useSpring(()=>({
        from:{transform:'rotate(0deg)'},
        config:{duration:100}
    }),[])
    const [level,apiLevel] = useSpring(()=>({
        from:{transform:'rotate(0deg)'},
        config:{duration:100}
    }),[])
    const [settings,apiSettings] = useSpring(()=>({
        from:{transform:'rotate(0deg)'},
        config:{duration:100}
    }),[])

  return <div className={"fixed m-auto left-0 right-0 top-0 bottom-0 bg-gray-800 z-50"}>
      <svg width={"100%"} height={"100%"} viewBox={"0 0 1920 1080"} preserveAspectRatio="xMidYMin slice">
          <image  x={0} y={0} height={"100%"} width={"100%"}  href={"./img/start-page-alb.png"} />
          <g transform={'translate(745 400)'}>
              <animated.g className={"origin-center transform-fill"} style={play}>
                  <image onPointerDown={()=>{
                      useGameStore.getState().setPage("game")
                  }} className={"cursor-pointer"} onMouseOver={()=>{
                      apiPlay.start(()=>({
                          to:direct
                      }))
                  }}   x={0} y={0}   href={"./img/play.png"} />
              </animated.g>
              <animated.g className={"origin-center transform-fill"} style={level}>
              <image  onMouseOver={()=>{
                  apiLevel.start(()=>({
                      to:direct
                  }))
              }} className={"cursor-pointer"} x={25} y={130}   href={"./img/level.png"} />
              </animated.g>
              <animated.g className={"origin-center transform-fill"} style={settings}>
              <image className={"cursor-pointer"} onMouseOver={()=>{
                  apiSettings.start(()=>({
                      to:direct
                  }))
              }} x={25} y={228}   href={"./img/settings.png"} />
              </animated.g>
          </g>
      </svg>
  </div>


}
