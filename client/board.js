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
    return mf.createElement("div", {class: "game-view"}, particls, Board(),chatMessage())
}

function Board() {
    const cellSize = calcCellSize();
    console.log(cellSize);
    
    return mf.createElement("div", {
        class: "board",
        style: `grid-template-rows: repeat(13, ${cellSize}px); grid-template-columns: repeat(15, ${cellSize}px);`
    }, cells(), players(cellSize))
}



function cells(size) {
    const cells = []
    store.getState().room.map.forEach((row) => {
        row.forEach((val) => {
            cells.push(mf.createElement("div", {
                class: val == 2 ? "solid" : val == 1 ? "soft" : "empty",
            }, ""))
        })
    });
    return cells
}

function players(cellSize) {
    const size = Math.trunc(cellSize*0.8)
    const players = []
    const initPos = [[1,1], [11,13], [1, 13], [11, 1]]
    store.getState().room.players.forEach((player, i) => {
        
        const x  = cellSize * initPos[i][1];
        const y = cellSize * initPos[i][0];
        
        const playerx = new Player(x, y, size, store.getState().ws, store.getState().room.id, player.nickname);
        if(player.nickname == store.getState().u_name) {
            setUpKeysEvents(playerx)
        }
        
        players.push(mf.createElement("div", {
            class: "player",
            style: `width: ${size}px; height: ${size}px; transform: translate(${x}px, ${y}px);`,
            ref: (el) => {
                playerx.elment = el
            }
        }))
        
        store.getState().players.push(playerx);

    })
    return players
}

function setUpKeysEvents(player) {
    addEventListener("keydown", (e) => {
        handleMovements(player,e.key)
    })
}

function handleMovements(player, direction) {
    switch (direction) {
        case "ArrowRight":
            player.moveRight();
            break;
        case "ArrowLeft":
            player.moveLeft();
            break;
        case "ArrowUp":
            player.moveUp();
            break;
        case "ArrowDown":
            player.moveDown();   
    }
}