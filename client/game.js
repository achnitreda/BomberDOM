import mf from "./mini-framework.js"

let unsubscribe
const app = document.getElementById("app")
export const store = mf.createStore({ view: "login",messages: [] })

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
            break;

    }
    if (unsubscribe) unsubscribe();
    mf.render(component(), app);
    unsubscribe = store.subscribe(() => {
        mf.render(component(), app)
    })
}

Render()