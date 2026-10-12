import useGameStore from "../store.js";

export default function TopPanel(){
    const pule = useGameStore((state)=>state.pule)
    const puleStep = useGameStore((state)=>state.puleStep)
    const scope = useGameStore((state)=>state.scope)
    return <div className={"fixed flex justify-between z-50 top-0 left-0 right-0 h-20 w-full bg-gray-950"}>
        <div className={"text-gray-50 text-2xl flex self-center ml-4"}>Очки {scope}</div>
        <div className={"text-gray-50 text-2xl flex self-center"}>Снаряды: {pule.length - puleStep}</div>
        <div className={"text-gray-50 text-2xl flex self-center mr-4"}>qwd</div>
    </div>
}