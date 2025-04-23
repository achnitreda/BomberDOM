// import { stringify } from "node:querystring";
import mf from "./mini-framework.js"

const app = document.getElementById("app")

const colors = [
    'rgba(155, 135, 245, 0.6)',
    'rgba(249, 115, 22, 0.6)',
    'rgba(51, 195, 240, 0.6)',
    'rgba(217, 70, 239, 0.6)',
    'rgba(139, 92, 246, 0.6)'
];

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

const bombIcon = mf.createElement("div", { class: "bomb-logo" },
   mf.createElement("div", {class: "bomb-logo-glow"}),
   mf.createElement("div", {class: "bomb-container"},
        mf.createElement("div", {class: "bomb-icon"}, 
            mf.createElement("svg", {
                xmlns: "http://www.w3.org/2000/svg",
                fill: "none",
                stroke: "red",
                strokeWidth: "2"
            }, 
                mf.createElement("circle", {cx: "12", cy: "12", r: "8"}),
                mf.createElement("path", {d: "M12 2v4"}),
                mf.createElement("path", {d: "M5 5l2.5 2.5"})
            )
        )
   )
)

const homePage = mf.createElement("div", { class: "bg" }, ...particls)

mf.render(homePage, app)