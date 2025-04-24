import mf from "./mini-framework.js"
import { store } from "./game.js";

function handleNameSub() {
    const name = store.getState().u_name

    const ws = new WebSocket("ws://localhost:3000")
    ws.onopen = () => {
        console.log("ws connected front!!!!");
        ws.send(name)
    }
    ws.onmessage = (msg) => {
        console.log(msg.data);
    }

}

function handleInput(e) {
    store.setState({u_name: e.target.value})
}

const colors = [
    'rgba(155, 135, 245, 0.6)',
    'rgba(249, 115, 22, 0.6)',
    'rgba(51, 195, 240, 0.6)',
    'rgba(217, 70, 239, 0.6)',
    'rgba(139, 92, 246, 0.6)'
];

const bombLogo = mf.createElement("div", { class: "logo-container"},
    mf.createElement('div', {class: "glow-bg"}),
    mf.createElement('div', {class: "logo"})
)

const particls = Array.from({ length: 30 }).map(() => {
    const size = Math.random() * 10 + 5;
    const color = colors[Math.floor(Math.random() * colors.length)];
    return (
        {
            s: {
                l: `left: ${Math.random() * 100 + '%'};`,
                r: `top: ${Math.random() * 100 + '%'};`,
                w: `width: ${size}px;`,
                h: `height: ${size}px;`,
                ad: `animation-delay: ${Math.random() * 2}s;`,
                bg: `background-color: ${color};`,
            }
        }
    )
}).map(el => {
    return (
        mf.createElement("div", {
            class: "pixel-particle",
            style: Object.values(el.s).join(' ')
        })
    )
})

const header = mf.createElement("h1", {class: "bomberman-header"}, "BOMBERMAN")

const loginEL = mf.createElement("div", {class: "login-container"},
    mf.createElement("input", {class: "u_name", type: "text", placeHolder: "Enter a nickname... ",
        value: "", onInput: handleInput}),
    mf.createElement("div", {class: "sub-bt", onClick: handleNameSub}, "START")
)

export const homePage = mf.createElement("div", { class: "home-view" }, ...particls, bombLogo, header, loginEL)
