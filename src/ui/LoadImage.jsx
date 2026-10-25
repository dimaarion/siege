export default function LoadImage(){
    let img = [
        "./img/bg-config-game-over.png",
        "./img/bg-config-game-over-2.png",
        "./img/bg-game-over.png",
        "./img/core.png",
        "./img/goblin-icon.png",
        "./img/level.png",
        "./img/level-game-over.png",
        "./img/level-step.png",
        "./img/load-text.png",
        "./img/money-icon.png",
        "./img/play.png",
        "./img/red-hover.png",
        "./img/repeat.png",
        "./img/repeat-level.png",
        "./img/resume.png",
        "./img/settings.png",
        "./img/star.png",
        "./img/star-over.png",
        "./img/start-page-alb.png",
        "./img/stone.png",
        "./img/stone.png",
        "./img/victory-bg-alb.png",
        "./img/white-over.png"
    ]
    return <div className={"hidden"}>
        {img.map((el,i)=><img  key={i + "image-load"} src={el}/>)}
    </div>
}