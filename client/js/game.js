import MiniFramework from "./mini-framework.js";

function startGame(map, players, currentPlayerId) {
    const board = initGame();

    createMap(map, board)

    createPlayers(players, currentPlayerId)

}

function initGame() {
    let boardElement = document.getElementById('game-board-container');

    boardElement.innerHTML = '';

    return boardElement
}

function createMap(map, board) {
    const cells = [];

    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[i].length; j++) {
            let cellClass = 'cell';

            switch (map[i][j]) {
                case 0:
                    cellClass += ' empty'
                    break
                case 1:
                    cellClass += ' softWall'
                    break
                case 2:
                    cellClass += ' solidWall'
                    break
            }

            const cell = MiniFramework.createElement('div', {
                id: `cell${i}#${j}`,
                class: cellClass,
            })

            cells.push(cell);
        }
    }

    const gameBoard = MiniFramework.createElement('div', {
        id: 'game-board'
    }, ...cells);

    MiniFramework.render(gameBoard, board);
}

function createPlayers(players, currentPlayerId) {
    const playersIds = Object.keys(players)
    const cellSize = 40

    playersIds.forEach((playerId, index) => {
        const player = players[playerId]

        const pxToCenter = Math.floor((cellSize - Math.round(cellSize * 0.8)) * 0.5);
        player.position = {
            x: cellSize * player.currentCell.j + pxToCenter,
            y: cellSize * player.currentCell.i + pxToCenter
        }

        const nameLabel = MiniFramework.createElement('div', {
            class: 'player-name'
        }, player.nickname)

        const playerClassNames = `player player-${index + 1}${playerId === currentPlayerId ? ' current-player' : ''}`

        const playerElement = MiniFramework.createElement('div', {
            id: `player-${playerId}`,
            class: playerClassNames,
            style: `transform: translate(${player.position.x}px, ${player.position.y}px);
                    background-size: ${cellSize * 0.8 * 4}px ${cellSize * 0.8 * 4}px;
                    background-position: 0px 0px;`
        }, nameLabel)

        const tempContainer = document.createElement('div');
        MiniFramework.render(playerElement, tempContainer);

        document.getElementById('game-board').appendChild(tempContainer.firstChild);
    })
}

export {
    startGame
}