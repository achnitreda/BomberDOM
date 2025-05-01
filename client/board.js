import { store } from "./game.js";
import mf from "./mini-framework.js";
import { particls } from "./home.js";
import { chatMessage } from "./waitingRoom.js";
import { Player } from "./player.js";

const MIN_CELL_SIZE = 32;
const MAX_CELL_SIZE = 64;

function calcCellSize() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    const availableWidth = windowWidth * 0.8;
    const availableHeight = windowHeight * 0.8;

    const cellByWidth = Math.floor(availableWidth / 15);
    const cellByHeight = Math.floor(availableHeight / 13);

    let cellSize = Math.min(cellByWidth, cellByHeight)

    cellSize = Math.max(MIN_CELL_SIZE, Math.min(cellSize, MAX_CELL_SIZE))

    return cellSize
}


export function GameView() {
    return mf.createElement("div", { class: "game-view" }, Board(), chatMessage())
}

function Board() {
    const cellSize = calcCellSize();
    // console.log(cellSize);

    return mf.createElement("div", {
        class: "board",
        style: `grid-template-rows: repeat(13, ${cellSize}px); grid-template-columns: repeat(15, ${cellSize}px);`
    }, Cells(), players(cellSize))
}



function Cells() {
    const cells = []
    store.getState().room.map.forEach((row, i) => {
        row.forEach((val, j) => {
            cells.push(mf.createElement("div", {
                id: `${i}#${j}`,
                class: val == 2 ? "solid" : val == 1 ? "soft" : "empty",
            }, ""))
        })
    });
    return cells
}

function players(cellSize) {
    const size = Math.trunc(cellSize)
    const players = []
    const initPos = [[1, 1], [11, 13], [1, 13], [11, 1]]
    // console.log(store.getState().speed, "spped => ", cellSize*3*0.016); // 3 = x * 3 *0.016// x = 3 / 3*0.016// 40, speed ,

    store.getState().speed.v = cellSize * 0.048
    console.log("init speed --> ",store.getState().speed);
    store.getState().room.players.forEach((player, i) => {

        const x = cellSize * initPos[i][1];
        const y = cellSize * initPos[i][0];
        const playerx = new Player(x, y, size, store.getState().room.id, player.nickname, player.avatar);
        if (player.nickname == store.getState().u_name) {
            // playerx.speed = cellSize * 0.048;
            // console.log("init speed --> ",playerx.speed);
            setUpKeysEvents(playerx)
        }
        
        players.push(mf.createElement("div", {
            class: "player",
            style: `width: ${size}px; height: ${size}px; transform: translate(${x}px, ${y}px);`,
            ref: (el) => {
                playerx.element = el
                playerx.bgResize()
            }
        }))

        // console.log("init for plys", playerx.speed,"-->", playerx.name);
        store.getState().players.push(playerx);

    })
    return players
}

function setUpKeysEvents(player) {
    const keys = ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"]
    addEventListener("keydown", (e) => {
        if(e.key === "z"){
            player.createBomb()
            store.getState().ws.send(JSON.stringify({type:"bomb", name:player.name, room_id: store.getState().room.id}))
        }

        if (keys.includes(e.key) && !player.moveKeys.includes(e.key)) {
            player[e.key]()
            player._sendPosition(e.key, "move")
            player.moveKeys.unshift(e.key)
        }   
    })

    addEventListener("keyup", (e) => {
        const keyIdx = player.moveKeys.indexOf(e.key)
            if (keyIdx != -1) {
                player._sendPosition(e.key, "stop")
                player.moveKeys.splice(keyIdx, 1)
            }
    })
}