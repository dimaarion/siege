import useGameStore from "../store.js";

export default function BottomMenu(){
    return <div>
        <div className={"fixed right-0 bottom-0 w-50 h-50 z-50"}>
            <div className={"flex gap-6"}>
                <div onPointerDown={()=>{
                    useGameStore.getState().towerRotationMinus()
                }} onPointerUp={()=>{
                    useGameStore.getState().towerRotationStop()
                }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="currentColor"
                         className="bi bi-arrow-left-square-fill" viewBox="0 0 16 16">
                        <path
                            d="M16 14a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v12zm-4.5-6.5H5.707l2.147-2.146a.5.5 0 1 0-.708-.708l-3 3a.5.5 0 0 0 0 .708l3 3a.5.5 0 0 0 .708-.708L5.707 8.5H11.5a.5.5 0 0 0 0-1z"/>
                    </svg>
                </div>
                <div onPointerDown={()=>{
                    useGameStore.getState().towerRotationPlus()
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
            <div onPointerDown={()=>{
                useGameStore.getState().shotStart()
            }} onPointerUp={()=>{

            }} className={"w-37 h-15 mt-3 flex justify-center rounded-xl bg-red-700"}><div className={"flex mt-3 text-white text-2xl"}>
                Выстрел
            </div></div>
        </div>
        <div className={"fixed left-0 bottom-0 w-50 h-50 z-50"}>
            <div onPointerDown={()=>{
                useGameStore.getState().rechargeStart()
            }} onPointerUp={()=>{
                useGameStore.getState().rechargeStop()
                useGameStore.getState().shotStop()
            }} className={"w-37 h-15 mt-3 flex justify-center rounded-xl bg-red-700"}><div className={"flex mt-3 text-white text-2xl"}>
                Перезарядка
            </div></div>
        </div>
    </div>
}