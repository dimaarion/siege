import {useMemo, useState} from 'react'
import useGameStore, {useStore} from "../../store.js";
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

    let s = true

    if(s){
        return <div className={"fixed m-auto left-0 right-0 top-0 bottom-0 bg-gray-800 z-50"}>
            <svg width={"100%"} height={"100%"} viewBox={"0 0 1920 1080"} preserveAspectRatio="xMidYMid slice">
                <image  x={0} y={0} height={"100%"} width={"100%"}  href={"./img/start-page-alb.png"} />
                <image  x={745} y={133}  width={430}  href={"./img/title.png"} />
                <g transform={'translate(745 400)'}>
                    <animated.g className={"origin-center transform-fill"} style={play}>
                        <image onPointerDown={()=>{
                            useGameStore.getState().setPage("game")
                            useGameStore.getState().setFallenBrickRestart()
                            useStore.getState().pauseStop()
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
    }else {
           return <div className={"fixed top-0 left-0 w-[1514px] h-[1080px] sm:w-[852px] sm:h-[479px] right-0 m-auto bg-[url(./img/start-page-alb.png)] origin-center  bg-center z-50 bg-contain bg-no-repeat"}>
            <div className={"absolute m-auto left-0 right-0 top-[10px] w-[313px] h-[146px] xl:w-[739px] xl:h-[351px] origin-center  bg-center z-50 bg-contain bg-no-repeat  bg-[url(./img/title.png)]"}/>
            <div className={"absolute m-auto left-0 right-0 top-[178px] w-[230px] h-[63px] xl:top-[385px] xl:w-[430px] xl:h-[116px] origin-center   z-20 bg-contain bg-no-repeat  bg-[url(./img/play.png)]"}/>
            <div className={"absolute m-auto left-0 right-0 top-[249px] w-[217px] h-[51px] xl:top-[521px] xl:w-[379px] xl:h-[86px] origin-center   z-20 bg-contain bg-no-repeat  bg-[url(./img/level.png)]"}/>
            <div className={"absolute m-auto left-0 right-0 top-[307px] w-[217px] h-[51px] xl:top-[627px] xl:w-[379px] xl:h-[86px] origin-center   z-20 bg-contain bg-no-repeat  bg-[url(./img/settings.png)]"}/>
        </div>
    }




}
