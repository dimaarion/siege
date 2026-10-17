import useGameStore from "../store.js";
import {useEffect} from "react";
import {generateTower, LEVEL_PROJECTILES} from "../action.js";

export default function TopPanel(){
    const pule = useGameStore((state)=>state.pule)
    const puleCount = useGameStore((state)=>state.puleCount)
    const level = useGameStore((state)=>state.level)
    const puleStep = useGameStore((state)=>state.puleStep)
    const scope = useGameStore((state)=>state.scope)
    const enemies = useGameStore((state)=>state.enemies)
    const bricks = useGameStore((state)=>state.bricks)

    useEffect(() => {
        useGameStore.getState().puleLevelStart(level)
    }, [level]);

    useEffect(() => {
        LEVEL_PROJECTILES.filter((el)=>el.lev === level).forEach((el)=>{
            if(el.enemies === enemies){
                useGameStore.getState().setPage("victory")
            }

        })
    }, [enemies, level]);
    useEffect(() => {
      console.log(generateTower())
    }, []);
    
    return <div className={"fixed flex justify-between z-20 top-0 left-0 right-0 h-20 w-full bg-gray-950"}>
        <div className={"text-gray-50 text-2xl flex self-center ml-4"}>Очки {scope}</div>
        <div className={"text-gray-50 text-2xl flex self-center"}>
            Уровень: {level}
        </div>
        <div className={"text-gray-50 text-2xl flex self-center"}>Снаряды: {puleStep !== pule.length + 1?(pule.length - puleStep):0}</div>
        <div onPointerDown={()=>{
            useGameStore.getState().pauseStart()
        }} className={"text-gray-50 cursor-pointer hover:text-red-700 text-2xl flex self-center mr-4"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor"
                 className="bi bi-pause-btn" viewBox="0 0 16 16">
                <path
                    d="M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5"/>
                <path
                    d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
            </svg>
        </div>
        <div onPointerDown={() => {
            useGameStore.getState().restartKeyStep()
            useGameStore.getState().puleStepRestart()
            useGameStore.getState().setSlant(1)
            useGameStore.getState().rechargeStop()
        }} className={"absolute left-2 top-22 bg-red-700 text-white rounded-2xl"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                 className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                <path
                    d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
            </svg>
        </div>
    </div>
}