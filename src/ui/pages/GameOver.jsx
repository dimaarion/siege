import {useState} from "react";

export default function GameOver(){
    const[resume,setResume] = useState(false)
    const[levels,setLevels] = useState(false)
    return <div className={"fixed m-auto left-0 right-0 top-0 bottom-0 bg-gray-800 z-50"}>
        <svg width={"100%"} height={"100%"} viewBox={"0 0 1920 1080"} preserveAspectRatio="xMidYMid slice">
        <image  x={0} y={0} height={"100%"} width={"100%"}  href={"./img/victory-bg-alb.png"} />
        <g transform={'translate(735 80)'}>
            <image  x={0} y={0} width={450}  href={"./img/bg-config-game-over.png"} />
            <text x={165} y={180} fill={"white"} fontSize={20}>1 Уровень</text>
            <text x={80} y={220} fill={"white"} fontSize={33}>Крепость разрушена</text>
        </g>
        <g transform={'translate(820 310)'}>
             <image  x={0} y={0}   href={"./img/star.png"} />
             <image  x={95} y={-10}   href={"./img/star-over.png"} />
             <image  x={190} y={0}   href={"./img/star.png"} />
        </g>
        <g transform={'translate(760 420)'}>
             <text x={0} y={0}  fill={"white"} fontSize={33} >Очки</text>
             <text x={400} y={0} textAnchor="end" fill={"white"} fontSize={33} >2000</text>
             <rect x={0} y={20} width={400} height={2} fill={"#3F4E64"}/>
        </g>
            <g transform={'translate(760 490)'}>
                <image  x={0} y={-40} width={60}  href={"./img/star.png"} />
                <image  x={60} y={-30} width={45}  href={"./img/goblin-icon.png"} />
                <text x={400} y={-5} textAnchor="end" fill={"white"} fontSize={33} >5 / 5</text>
                <text x={120} y={-5}  fill={"white"} fontSize={20} >Все гоблины побеждены</text>
                <rect x={0} y={25} width={400} height={2} fill={"#3F4E64"}/>
            </g>
            <g transform={'translate(760 560)'}>
                <image  x={0} y={-40} width={60}  href={"./img/star.png"} />
                <image  x={65} y={-28} width={35}  href={"./img/core.png"} />
                <text x={400} y={-5} textAnchor="end" fill={"white"} fontSize={33} >5 / 5</text>
                <text x={120} y={-5}  fill={"white"} fontSize={20} >Сохранено снарядов</text>
                <rect x={0} y={25} width={400} height={2} fill={"#3F4E64"}/>
            </g>
            <g transform={'translate(760 630)'}>
                <image  x={0} y={-40} width={60}  href={"./img/star.png"} />
                <image  x={65} y={-26} width={35}  href={"./img/stone.png"} />
                <text x={400} y={-5} textAnchor="end" fill={"white"} fontSize={33} >100%</text>
                <text x={120} y={-5}  fill={"white"} fontSize={20} >Разрушение крепости</text>
                <rect x={0} y={25} width={400} height={2} fill={"#3F4E64"}/>
            </g>
            <g transform={'translate(785 680)'}>
                <g onMouseOver={()=>{
                    setResume(true)
                }} onMouseOut={()=>{
                    setResume(false)
                }}>
                    {resume?<image cursor={"pointer"} x={-75} y={-60} width={500} href={"./img/red-hover.png"}/>:""}
                    <image  cursor={"pointer"} x={0} y={0} width={350}  href={"./img/level-step.png"} />

                </g>

            </g>
            <g transform={'translate(785 770)'}>
                {levels?<image cursor={"pointer"} x={165} y={-19} width={230} href={"./img/white-over.png"}/>:""}
                <image cursor={"pointer"} x={-22} y={0} width={190}  href={"./img/repeat.png"} />
                <image onMouseOver={()=>{
                    setLevels(true)
                }} onMouseOut={()=>{
                    setLevels(false)
                }} cursor={"pointer"} x={185} y={0} width={190}  href={"./img/level-game-over.png"} />

            </g>
        </svg>
    </div>
}