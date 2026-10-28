import { create } from 'zustand'
import {LEVEL_PROJECTILES, PROJECTILES, pickNext} from "./action.js";



const useGameStore = create((set) => ({
    towerRotation: 0,
    towerRotationPlus: () => set(() => ({ towerRotation: 0.1 })),
    towerRotationMinus: () => set(() => ({ towerRotation: -0.1 })),
    towerRotationStop: () => set(() => ({ towerRotation: 0 })),
    shot:0,
    shotStart:()=>set(()=>({shot: 20})),
    shotMin:()=>set(()=>({shot: -1})),
    shotStop:()=>set(()=>({shot: 0})),
    recharge:false,
    rechargeStart:()=>set(()=>({recharge: true})),
    rechargeStop:()=>set(()=>({recharge: false})),
    movement:0,
    movementForward:()=>set(()=>({movement:1})),
    movementBackward:()=>set(()=>({movement:-1})),
    movementStop:()=>set(()=>({movement:0})),
    force:1,
    setForce:(el)=>set(()=>({force:el})),
    pule:PROJECTILES,
    // Набор снарядов уровня берётся из PROJECTILES, а не из текущего state.pule:
    // иначе на втором уровне искать было бы только среди снарядов первого.
    puleLevelStart:(lev)=>set(()=>{
        const level = LEVEL_PROJECTILES.find((el)=>el.lev === lev)
        if(!level) return {}
        return {pule: level.pule.map((id)=>PROJECTILES.find((p)=>p.id === id)).filter(Boolean)}
    }),
    // Сделать ядро с номером index следующим для зарядки (см. AmmoSelector)
    puleChoose:(index)=>set((state)=>({pule: pickNext(state.pule, state.puleStep, index)})),
    puleStep:0,
    puleStepStart:()=>set((state)=>({puleStep:state.puleStep + 1})),
    puleStepRestart:()=>set(()=>({puleStep:0})),
    puleCount:0,
    puleCountStep:()=>set((state)=>({puleCount:state.puleCount + 1})),
    camera:false,
    cameraStart:()=>set(()=>({camera:true})),
    cameraStop:()=>set(()=>({camera:false})),
    slant:0.5,
    setSlant:(el)=>set(()=>({slant:el})),
    scope:0,
    scopeStep:()=>set((state)=>({scope:state.scope + 50})),
    scopeGoblin:()=>set((state)=>({scope:state.scope + 100})),
    setScope:(el)=>set((state)=>({scope:state.scope + el})),
    restartKey:0,
    restartKeyStep:()=>set((state)=>({restartKey:state.restartKey + 1})),
    restartKeyResume:()=>set(()=>({restartKey:0})),
    page:"",
    setPage:(el)=>set(()=>({page:el})),
    master:0,
    setMaster:(el)=>set(()=>({master:el})),
    music:0,
    setMusic:(el)=>set(()=>({music:el})),
    effects:0,
    setEffects:(el)=>set(()=>({effects:el})),
    pause:false,
    pauseStart:()=>set(()=>({pause:true})),
    pauseStop:()=>set(()=>({pause:false})),
    level:2,
    setLevel:(el)=>set(()=>({level:el})),
    setLevelStep:()=>set((state)=>({level:state.level + 1})),
    enemies:0,
    setEnemies:()=>set((state)=>({enemies:state.enemies + 1})),
    enemiesRestart:()=>set(()=>({enemies:0})),
    destruction:0,
    setDestruction:(el)=>set(()=>({destruction:el})),
    bricks:0,
    setBricks:(el)=>set((state)=>({bricks:state.bricks + el})),
    bricksRestart:()=>set(()=>({bricks:0})),
    fallenBrick:0,
    setFallenBrick:(el)=>set((state)=>({fallenBrick:state.fallenBrick + el})),
    setFallenBrickRestart:()=>set(()=>({fallenBrick:0})),
}))



export default useGameStore
