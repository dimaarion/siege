import useGameStore from "../store.js";

export default function TopPanel(){
    const pule = useGameStore((state)=>state.pule)
    const puleStep = useGameStore((state)=>state.puleStep)
    const scope = useGameStore((state)=>state.scope)
    return <div className={"fixed flex justify-between z-20 top-0 left-0 right-0 h-20 w-full bg-gray-950"}>
        <div className={"text-gray-50 text-2xl flex self-center ml-4"}>Очки {scope}</div>
        <div className={"text-gray-50 text-2xl flex self-center"}>Снаряды: {puleStep !== pule.length + 1?(pule.length - puleStep):0}</div>
        <div className={"text-gray-50 text-2xl flex self-center mr-4"}>qwd</div>
        <div onPointerDown={()=>{
            useGameStore.getState().restartKeyStep()
            useGameStore.getState().puleStepRestart()
            useGameStore.getState().setSlant(1)
        }} className={"absolute right-2 top-22 bg-red-700 text-white rounded-2xl"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                 className="bi bi-arrow-counterclockwise" viewBox="0 0 16 16">
                <path fillRule="evenodd" d="M8 3a5 5 0 1 1-4.546 2.914.5.5 0 0 0-.908-.417A6 6 0 1 0 8 2z"/>
                <path
                    d="M8 4.466V.534a.25.25 0 0 0-.41-.192L5.23 2.308a.25.25 0 0 0 0 .384l2.36 1.966A.25.25 0 0 0 8 4.466"/>
            </svg>
        </div>
    </div>
}