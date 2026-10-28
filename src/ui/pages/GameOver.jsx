import {useMemo, useState} from "react";
import useGameStore from "../../store.js";
import {LEVEL_PROJECTILES} from "../../action.js";

export default function GameOver(){

    const level = useGameStore((state)=>state.level)
    const bricks = useGameStore((state)=>state.bricks)
    const fallenBrick = useGameStore((state)=>state.fallenBrick)
    const pule = useGameStore((state)=>state.pule)
    const enemies = useGameStore((state)=>state.enemies)
    const puleStep = useGameStore((state)=>state.puleStep)
    const scope = useGameStore((state)=>state.scope)
    const shotsUsed = pule.length - puleStep


    const  enemiesTotal = LEVEL_PROJECTILES.find((el)=>el.lev === level).enemies

    const[resume,setResume] = useState(false)
    const[levels,setLevels] = useState(false)
    const[restart,setRestart] = useState(false)

    const destructionPrecent = 50

    const destruction = useMemo(()=>{
        let p = (fallenBrick * 100 / bricks)
        return p > 100?100:p.toFixed(0) // процент разрушенных объектов, 0–100
    },[bricks, fallenBrick])

    const victory = useMemo(()=>{
        return enemies === enemiesTotal && destruction > destructionPrecent
    },[destruction, enemies, enemiesTotal])
    
    return <div className={"fixed m-auto left-0 right-0 top-0 bottom-0 bg-gray-800 z-50"}>
        <svg width={"100%"} height={"100%"} viewBox={"0 0 1920 1080"} preserveAspectRatio="xMidYMid slice">
        <image  x={0} y={0} height={"100%"} width={"100%"}  href={"./img/victory-bg-alb.png"} />
        <g transform={'translate(735 80)'}>
            {victory?<image x={0} y={0} width={450} href={"./img/bg-config-game-over.png"}/>:<image x={0} y={0} width={450} href={"./img/bg-config-game-over-2.png"}/>}
            <text x={180} y={victory?180:40} fill={"white"} fontSize={20}>{level} Уровень</text>
            {victory?<text x={80} y={220} fill={"white"} fontSize={33}>Крепость разрушена</text>:
                <text x={80} y={80} fill={"white"} fontSize={33}>ОСАДА ПРОВАЛЕНА</text>}
        </g>
            {victory?<g transform={'translate(820 310)'}>
                {enemies === enemiesTotal ? <image x={0} y={0} href={"./img/star.png"}/> :
                    <image x={0} y={0} href={"./img/star-over.png"}/>}
                {shotsUsed !== 0 ? <image x={95} y={-10} href={"./img/star.png"}/> :
                    <image x={95} y={-10} href={"./img/star-over.png"}/>}
                {destruction > destructionPrecent ? <image x={190} y={0} href={"./img/star.png"}/> :
                    <image x={190} y={0} href={"./img/star-over.png"}/>}
            </g>:""}
        <g transform={'translate(760 420)'}>
            <image x={0} y={-50} href={"./img/money-icon.png"} />
             <text x={400} y={0} textAnchor="end" fill={"white"} fontSize={33} >{scope}</text>
             <rect x={0} y={20} width={400} height={2} fill={"#3F4E64"}/>
        </g>
            <g transform={'translate(760 490)'}>
                {enemies === enemiesTotal?<image x={0} y={-40} width={60} href={"./img/star.png"}/>:<image x={0} y={-40} width={60} href={"./img/star-over.png"}/>}
                <image  x={60} y={-30} width={45}  href={"./img/goblin-icon.png"} />
                <text x={400} y={-5} textAnchor="end" fill={"white"} fontSize={33} >{enemiesTotal} / {enemies}</text>
                <text x={120} y={-5}  fill={"white"} fontSize={20} >Все гоблины побеждены</text>
                <rect x={0} y={25} width={400} height={2} fill={"#3F4E64"}/>
            </g>
            <g transform={'translate(760 560)'}>
                {shotsUsed !== 0?<image x={0} y={-40} width={60} href={"./img/star.png"}/>:<image x={0} y={-40} width={60} href={"./img/star-over.png"}/>}
                <image  x={65} y={-28} width={35}  href={"./img/core.png"} />
                <text x={400} y={-5} textAnchor="end" fill={"white"} fontSize={33} >{shotsUsed} / {pule.length}</text>
                <text x={120} y={-5}  fill={"white"} fontSize={20} >Сохранено снарядов</text>
                <rect x={0} y={25} width={400} height={2} fill={"#3F4E64"}/>
            </g>
            <g transform={'translate(760 630)'}>
                {destruction > destructionPrecent?<image x={0} y={-40} width={60} href={"./img/star.png"}/>:<image x={0} y={-40} width={60} href={"./img/star-over.png"}/>}
                <image  x={65} y={-26} width={35}  href={"./img/stone.png"} />
                <text x={400} y={-5} textAnchor="end" fill={"white"} fontSize={33} >  {destruction}%</text>
                <text x={120} y={-5}  fill={"white"} fontSize={20} >Разрушение крепости</text>
                <rect x={0} y={25} width={400} height={2} fill={"#3F4E64"}/>
            </g>
            <g transform={'translate(785 680)'}>
                <g onMouseOver={()=>{
                    setResume(true)
                }} onMouseOut={()=>{
                    setResume(false)
                }}>
                    {resume?<image  cursor={"pointer"} x={-75} y={-60} width={500} href={"./img/red-hover.png"}/>:""}
                    {victory?<image onPointerDown={()=>{
                            useGameStore.getState().setLevelStep()
                            useGameStore.getState().setPage("game")
                            useGameStore.getState().restartKeyStep()
                            useGameStore.getState().puleStepRestart()
                            useGameStore.getState().rechargeStop()
                            useGameStore.getState().enemiesRestart()
                        }} cursor={"pointer"} x={0} y={0} width={350} href={"./img/level-step.png"}/>:
                        <image onPointerDown={()=>{
                            useGameStore.getState().restartKeyStep()
                            useGameStore.getState().puleStepRestart()
                            useGameStore.getState().rechargeStop()
                            useGameStore.getState().setFallenBrickRestart()
                            useGameStore.getState().bricksRestart()
                            useGameStore.getState().setPage("game")
                            useGameStore.getState().enemiesRestart()
                        }} cursor={"pointer"} x={0} y={0} width={350} href={"./img/repeat-level.png"}/>}

                </g>

            </g>
            <g transform={'translate(785 770)'}>
                {levels?<image cursor={"pointer"} x={165} y={-19} width={230} href={"./img/white-over.png"}/>:""}
                {restart?<image cursor={"pointer"} x={-42} y={-19} width={230} href={"./img/white-over.png"}/>:""}
                <image onMouseOver={()=>{
                    setRestart(true)
                }} onMouseOut={()=>{
                    setRestart  (false)
                }} cursor={"pointer"} x={-22} y={0} width={190}  href={"./img/repeat.png"} />
                <image onMouseOver={()=>{
                    setLevels(true)
                }} onMouseOut={()=>{
                    setLevels(false)
                }} cursor={"pointer"} x={185} y={0} width={190}  href={"./img/level-game-over.png"} />

            </g>
        </svg>
    </div>
}