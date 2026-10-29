import useGameStore, {useStore} from "../store.js";
import AmmoSelector from "./AmmoSelector.jsx";


export default function BottomMenu(){
    const force = useGameStore((state)=>state.force)
    const slant = useGameStore((state)=>state.slant)
    const recharge = useGameStore((state)=>state.recharge)
    const pule = useGameStore((state)=>state.pule)
    const puleStep = useGameStore((state)=>state.puleStep)

    return <div>
        <div className={"fixed right-0 bottom-0 w-40 h-25 z-20"}>

                <AmmoSelector radius={5} />


            <div onClick={()=>{
                useGameStore.getState().shotStart()
            }}  className={"w-37 h-15 mt-3 flex justify-center rounded-xl bg-red-700"}><div className={"flex mt-3 text-white text-2xl"}>
                Выстрел
            </div></div>
        </div>
        <div className={"fixed left-3 bottom-20 w-50 h-50 z-20"}>

            <div className={"w-full flex justify-center"}>
                <div className={"relative opacity-80 w-[180px] h-[180px]"}>
                    <div className={"absolute left-0 m-auto w-[60px] h-[60px] right-0 top-0"} onPointerDown={() => {
                        useGameStore.getState().movementForward()
                    }} onPointerUp={() => {
                        useGameStore.getState().movementStop()
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                             className="bi bi-arrow-up-square-fill" viewBox="0 0 16 16">
                            <path
                                d="M2 16a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H2zm6.5-4.5V5.707l2.146 2.147a.5.5 0 0 0 .708-.708l-3-3a.5.5 0 0 0-.708 0l-3 3a.5.5 0 1 0 .708.708L7.5 5.707V11.5a.5.5 0 0 0 1 0z"/>
                        </svg>
                    </div>
                    <div className={"absolute m-auto w-[60px] h-[60px] left-0 right-0 bottom-0"} onPointerDown={() => {
                        useGameStore.getState().movementBackward()
                    }} onPointerUp={() => {
                        useGameStore.getState().movementStop()
                    }} >
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                             className="bi bi-arrow-down-square-fill" viewBox="0 0 16 16">
                            <path
                                d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2zm6.5 4.5v5.793l2.146-2.147a.5.5 0 0 1 .708.708l-3 3a.5.5 0 0 1-.708 0l-3-3a.5.5 0 1 1 .708-.708L7.5 10.293V4.5a.5.5 0 0 1 1 0z"/>
                        </svg>
                    </div>
                    <div className={"absolute m-auto w-[60px] h-[60px] left-0 top-0 bottom-0"} onPointerDown={()=>{
                        useGameStore.getState().towerRotationPlus()
                    }} onPointerUp={()=>{
                        useGameStore.getState().towerRotationStop()
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                             className="bi bi-arrow-left-square-fill" viewBox="0 0 16 16">
                            <path
                                d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1z"/>
                        </svg>
                    </div>
                    <div className={"absolute m-auto w-[60px] h-[60px] right-0 top-0 bottom-0"} onPointerDown={()=>{
                        useGameStore.getState().towerRotationMinus()
                    }} onPointerUp={()=>{
                        useGameStore.getState().towerRotationStop()
                    }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                             className="bi bi-arrow-right-square-fill" viewBox="0 0 16 16">
                            <path
                                d="M0 14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2H2a2 2 0 0 0-2 2v12zm4.5-6.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5a.5.5 0 0 1 0-1z"/>
                        </svg>
                    </div>
                </div>
            </div>
            <div onPointerDown={() => {
                useGameStore.getState().rechargeStart()
                if(!recharge && pule.length + 1 > puleStep){
                    useGameStore.getState().puleStepStart()
                }

            }} onPointerUp={() => {
                useGameStore.getState().shotStop()
            }} className={"w-50 h-15 mt-3 flex justify-center rounded-xl bg-red-700"}>
                <div className={"flex mt-3 text-white text-2xl"}>
                    Перезарядка
            </div></div>
        </div>
        <div className={"fixed left-0 right-0 m-auto bottom-2 w-80 xl:w-200 h-20 z-20"}>
            <div className={"flex gap-4  w-full ml-6"}>
                <div className={"w-full  bg-gray-900"}>
                    <input onChange={(e)=>{
                        useGameStore.getState().setForce(e.target.value)
                    }} value={force} className={"w-full appearance-none bg-red-700"} type={"range"} min={1} max={6} step={0.01}/>
               <div className={"p-2 text-xl   text-gray-50 text-center"}>Сила выстрела</div>
                </div>
                {/*<div className={"w-1/2  bg-gray-900"}>
                    <input onChange={(e)=>{
                        useGameStore.getState().setSlant(e.target.value)
                    }} value={slant} className={"w-full  appearance-none bg-red-700"} type={"range"} min={0} max={1.5} step={0.01}/>
                    <div className={"p-2 text-xl   text-gray-50 text-center"}>Угол наклона</div>
                </div>*/}
            </div>
        </div>

    </div>
}