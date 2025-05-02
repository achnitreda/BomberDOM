import mf from "./mini-framework.js"
import { setTimer } from "./board.js"

let unsubscribe
const app = document.getElementById("app")
export const store = mf.createStore({ view: "login", messages: [], players: [], ws: null, speed: {v:0} })

export async function Render() {
    let component = null
    switch (store.getState().view) {
        case "login":
            const { homePage } = await import("./home.js");
            component = homePage;
            break;
        case "waiting":
            const { WaitingRoom } = await import("./waitingRoom.js");
            component = WaitingRoom;
            break;
        case "game":
            const { GameView } = await import("./board.js");
            component = GameView;
            requestAnimationFrame(gameloop)

            break;

    }
    if (unsubscribe) unsubscribe();
    mf.render(component(), app);
    unsubscribe = store.subscribe(() => {
        mf.render(component(), app)
    })
}

Render()

let frameNb = 0;

export function GameResultOverlay(message) {
    return mf.createElement("div", {
        class: "game-result-overlay"
    }, mf.createElement("div", { class: "message" }, message))
}



function gameloop(time) {

    const sec = Math.floor(frameNb / 60);
    const minu = Math.floor(sec / 60);
    setTimer(sec, minu);
    
    store.getState().players.forEach(player => {
        if (player.moveKeys.length && player.alive) {
            player[player.moveKeys[0]]();
            player.renderMovement();
            player.moveAnimate(time, player.moveKeys[0]);
            
        }

        if (!player.alive || player.revive) {
            player.deathAnimation(time)
        }

        player.bombs.forEach(bomb => {
            bomb.animate(time);
        })

        player.explotionBombs.forEach(bomb => {            
            bomb.handleExplotionAnimation(time);
        })

    });
    frameNb++
    requestAnimationFrame(gameloop)
}
