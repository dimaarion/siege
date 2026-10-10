import { create } from 'zustand'

const useGameStore = create((set) => ({
    towerRotation: 0,
    towerRotationPlus: () => set((state) => ({ towerRotation: state.towerRotation + 1 })),
    towerRotationMinus: () => set((state) => ({ towerRotation: state.towerRotation - 1 })),
    towerRotationStop: () => set(() => ({ towerRotation: 0 })),
    shot:-10,
    shotStart:()=>set(()=>({shot: 2 * 10})),
    shotMin:()=>set(()=>({shot: -5})),
    shotStop:()=>set(()=>({shot: 0})),
    recharge:false,
    rechargeStart:()=>set(()=>({recharge: true})),
    rechargeStop:()=>set(()=>({recharge: false})),
}))


export default useGameStore