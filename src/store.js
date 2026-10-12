import { create } from 'zustand'

const useGameStore = create((set) => ({
    towerRotation: 0,
    towerRotationPlus: () => set((state) => ({ towerRotation: state.towerRotation + 1 })),
    towerRotationMinus: () => set((state) => ({ towerRotation: state.towerRotation - 1 })),
    towerRotationStop: () => set(() => ({ towerRotation: 0 })),
    shot:0,
    shotStart:()=>set(()=>({shot: 2 * 10})),
    shotMin:()=>set(()=>({shot: -1})),
    shotStop:()=>set(()=>({shot: 0})),
    recharge:false,
    rechargeStart:()=>set(()=>({recharge: true})),
    rechargeStop:()=>set(()=>({recharge: false})),
    movement:0,
    movementForward:()=>set(()=>({movement:50})),
    movementBackward:()=>set(()=>({movement:-50})),
    movementStop:()=>set(()=>({movement:0})),
    force:2,
    setForce:(el)=>set(()=>({force:el})),
    pule:[1,2,3,4,5,6,7,8,9],
    puleStep:1,
    puleStepStart:()=>set((state)=>({puleStep:state.puleStep + 1})),
    puleStepRestart:()=>set(()=>({puleStep:0})),
    camera:false,
    cameraStart:()=>set(()=>({camera:true})),
    cameraStop:()=>set(()=>({camera:false})),
    slant:1,
    setSlant:(el)=>set(()=>({slant:el})),
    scope:0,
    scopeStep:()=>set((state)=>({scope:state.scope + 10})),
}))


export default useGameStore