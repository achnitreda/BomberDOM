import mf from "./mini-framework.js"
import { Render, store } from "./game.js";

function handleNameSub() {
    const name = store.getState().u_name
    let ws = store.getState().ws

    if (!ws) {
        ws = new WebSocket("ws://10.1.7.8:3000")
        store.setState({ ws })

        ws.onopen = () => {
            console.log("ws connected front!!!!");
            const msg = {
                type: "join",
                u_name: name
            }
            ws.send(JSON.stringify(msg))
        }

        ws.onmessage = (msg) => {
            const data = JSON.parse(msg.data);
            switch (data.type) {
                case "name taken":
                    store.setState({ loginError: "this name is taken, choose another one!!!" }); break;
                case "waiting room update":

                    store.setState({
                        // view: "waiting",
                        playersNames: data.payload.playersNames,
                        playerCount: data.payload.playerCount,
                    });
                    Render("waiting");
                    break;
                case 'countdown':
                    store.setState({ countdown: data.countdown, isWaiting: data.isWaiting });
                    // Render('countdown');
                    break;
                case 'start game':
                    // store.setState({ view: 'game' });
                    store.setState({ room: data.game });
                    Render('game');
                    break;
                case 'chatMessage':
                    store.getState().messages.push({
                        id: Date.now().toString(),
                        text: data.message.text,
                        nickname: data.message.nickname,
                        time: new Date(data.message.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    })
                    // Render();
                    break;
                case "movement":
                    store.getState().players.forEach(player => {
                        if (player.name === data.name) {
                            if (data.event == "move") {
                                player.position.x = data.amount[0] * (player.size);
                                player.position.y = data.amount[1] * (player.size);
                                if (!player.moveKeys.includes(data.dir)) {
                                    player.moveKeys.unshift(data.dir)
                                }
                            } else {
                                const keyIdx = player.moveKeys.indexOf(data.dir)
                                if (keyIdx != -1) {
                                    player.moveKeys.splice(keyIdx, 1)
                                }
                            }
                        }
                    });
                    break;
                case "bomb":
                    store.getState().players.forEach(player => {
                        if (player.name === data.name) {
                            player.createBomb()
                        }
                    })
                    break;
                case "disconnect":
                    store.getState().players.forEach(player => {
                        if (player.name === data.name) {
                            const idx = store.getState().players.indexOf(player)
                            player.element.remove()
                            store.getState().players.splice(idx, 1)
                        }
                    })
                    
            }
        }

        return
    }

    const msg = {
        type: "join",
        u_name: name
    }
    ws.send(JSON.stringify(msg))
}

const colors = [
    'rgba(155, 135, 245, 0.6)',
    'rgba(249, 115, 22, 0.6)',
    'rgba(51, 195, 240, 0.6)',
    'rgba(217, 70, 239, 0.6)',
    'rgba(139, 92, 246, 0.6)'
];

const bombLogo = () => {
    return mf.createElement("div", { class: "logo-container" },
        mf.createElement('div', { class: "glow-bg" }),
        mf.createElement('div', { class: "logo" })
    )
}

export const particls = Array.from({ length: 30 }).map(() => {
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

const header = () => {
    return mf.createElement("h1", { class: "bomberman-header" }, "BOMBERMAN")
}

const loginEL = () => {
    return mf.createElement("div", { class: "login-container" },
        mf.createElement("input", {
            class: "u_name", type: "text", placeHolder: "Enter a nickname... ",
            value: store.getState().u_name || '', onInput: (e) => store.setState({ u_name: e.target.value })
        }),
        mf.createElement("div", { style: "color: red;text-align: center" }, store.getState().loginError),
        mf.createElement("div", { class: "sub-bt", onClick: handleNameSub }, "START")
    )
}

export function homePage() {
    return mf.createElement("div", { class: "home-view" }, particls, bombLogo(), header(), loginEL())
} 
