import mf from "./mini-framework.js"
export const store = mf.createStore({})
import { homePage } from "./home.js"

const app = document.getElementById("app")

mf.render(homePage, app);