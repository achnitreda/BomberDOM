import mf from "./mini-framework.js"

let unsubscribe
const app = document.getElementById("app")
export const store = mf.createStore({ view: "login" })

export async function Render() {
    let component = null
    switch (store.getState().view) {
        case "login":
            const { homePage } = await import("./home.js");
            component = homePage;
            break;
        case "game":
            const { GameView } = await import("./board.js");
            component = GameView;

    }
    if (unsubscribe) unsubscribe();
    mf.render(component(), app);
    unsubscribe = store.subscribe(() => {
        mf.render(component(), app)
    })
}

Render()