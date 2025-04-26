import mf from "./mini-framework.js"
export const store = mf.createStore({ view: "login" })
// import { homePage } from "./home.js"

const app = document.getElementById("app")

async function Render() {
    let component = null
    switch (store.getState().view) {
        case "login":
            const { homePage } = await import("./home.js");
            component = homePage;
            store.subscribe(() => {
                console.log("rerender");
                
                mf.render(homePage(), app)
            })
            break;
    }

    mf.render(component(), app);
    
}

Render()