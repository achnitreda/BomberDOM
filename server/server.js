import http from 'http'
import fs from 'fs'
import path from 'path'
import { WebSocket, WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid';

let activeRoom = {
    playerCount: 0,
    players: {},
    state: 'waiting',
    countdown: null,
    countdownInterval: null,
    grid: null,
}

let clients = {}

// Create Http server
const server = http.createServer((req, res) => {
    let filePath = `../client${req.url}`
    if (req.url === '/') {
        filePath = '../client/index.html'
    }

    const extname = path.extname(filePath)

    let contentType = 'text/html'

    switch (extname) {
        case '.js':
            contentType = 'text/javascript'
            break
        case '.css':
            contentType = 'text/css';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.jpg':
            contentType = 'image/jpg';
            break;
    }

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code == 'ENOENT') {
                res.writeHead(404)
                res.end('File not found')
            } else {
                res.writeHead(500)
                res.end(`Server error ${error.code}`)
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType })
            res.end(content)
        }
    })
})


function startCountdown() {
    if (activeRoom.state !== 'waiting') return

    activeRoom.state = 'countdown'
    activeRoom.countdown = 2

    broadcastToAll({
        type: 'countdown',
        countdown: activeRoom.countdown,
        isWaiting: false
    })

    activeRoom.countdownInterval = setInterval(() => {
        activeRoom.countdown--

        if (activeRoom.countdown <= 0) {
            clearInterval(activeRoom.countdownInterval)
            startGame()
        } else {
            broadcastToAll({
                type: 'countdown',
                countdown: activeRoom.countdown,
                isWaiting: false
            })
        }
    }, 1000)
}

function startGame() {
    activeRoom.state = 'playing'

    const map = generateMap()
    activeRoom.grid = map

    broadcastToAll({
        type: 'gameStart',
        players: activeRoom.players,
        map: map
    })

}

function generateMap() {
    const width = 15
    const height = 13
    const map = []

    const empty = 0
    const soft = 1
    const solid = 2

    for (let i = 0; i < height; i++) {
        map[i] = []
        for (let j = 0; j < width; j++) {
            if (i === 0 || i === height - 1 || j === 0 || j === width - 1) {
                map[i][j] = solid
            } else if (i % 2 === 0 && j % 2 === 0) {
                map[i][j] = solid
            } else if ((i <= 2 && j <= 2) ||  // Top-left
                (i <= 2 && j >= width - 3) ||  // Top-right
                (i >= height - 3 && j <= 2) ||  // Bottom-left
                (i >= height - 3 && j >= width - 3)  // Bottom-right
            ) {
                map[i][j] = empty
            } else {
                map[i][j] = Math.random() < 0.6 ? empty : soft;
            }
        }
    }

    return map
}

function addPlayerToRoom(playerId, nickname) {
    if (activeRoom.playerCount >= 4) return false

    const positions = [
        { i: 1, j: 1 },        // Top-left
        { i: 1, j: 13 },       // Top-right
        { i: 11, j: 1 },       // Bottom-left
        { i: 11, j: 13 }       // Bottom-right
    ];

    const posIndex = activeRoom.playerCount;

    activeRoom.players[playerId] = {
        id: playerId,
        nickname,
        alive: true,
        lifes: 3,
        bombs: 1,
        flames: 1,
        speed: 1,
        position: { x: 0, y: 0 },
        currentCell: positions[posIndex],
    }

    activeRoom.playerCount++

    if (activeRoom.playerCount === 4) {
        startCountdown()
    } else if (activeRoom.playerCount >= 2 && !activeRoom.countdownInterval && activeRoom.state === 'waiting') {
        let waitTime = 5;

        broadcastToAll({
            type: 'countdown',
            countdown: waitTime,
            isWaiting: true
        });

        activeRoom.countdownInterval = setInterval(() => {
            waitTime--;

            broadcastToAll({
                type: 'countdown',
                countdown: waitTime,
                isWaiting: true
            });

            if (waitTime <= 0) {
                clearInterval(activeRoom.countdownInterval);
                activeRoom.countdownInterval = null;

                if (activeRoom.state === 'waiting' && activeRoom.playerCount >= 2) {
                    startCountdown();
                }
            }
        }, 1000);

    }
    return true
}

function removePlayerFromRoom(playerId) {
    if (!activeRoom.players[playerId]) return false;

    delete activeRoom.players[playerId];
    activeRoom.playerCount--;

    broadcastToAll({
        type: 'playerLeft',
        playerId
    });

    if (activeRoom.playerCount < 2) {
        if (activeRoom.countdownInterval) {
            clearInterval(activeRoom.countdownInterval);
            activeRoom.countdownInterval = null;
        }

        activeRoom.state = 'waiting';

        broadcastToAll({
            type: 'countdownCancelled'
        });
    }

    if (activeRoom.playerCount === 0) {
        resetRoom();
    }

    return true
}

function broadcastToOthers(sender, message) {
    wss.clients.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}

function broadcastToAll(message) {
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}

function handleDisconnect(playerId) {
    removePlayerFromRoom(playerId);
    delete clients[playerId];
}

function resetRoom() {
    if (activeRoom.countdownInterval) {
        clearInterval(activeRoom.countdownInterval);
    }

    activeRoom = {
        playerCount: 0,
        players: {},
        state: 'waiting',
        countdown: null,
        countdownInterval: null,
    }

    broadcastToAll({
        type: 'roomReset'
    })
}

function handleChatMessage(playerId, data) {
    if (!activeRoom.players[playerId]) return

    if (data.message.length > 100) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Message is too long.'
        }))
        return
    }
    if (data.message.length < 1) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Message is too short.'
        }))
        return
    }

    const message = {
        type: 'chatMessage',
        sender: activeRoom.players[playerId].nickname,
        message: data.message,
        timestamp: Date.now()
    };

    broadcastToAll(message)
}

// Setup Websocket server
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
    console.log('Client connected')

    const playerId = uuidv4()

    clients[playerId] = ws

    ws.send(JSON.stringify({
        type: 'playerId',
        playerId
    }))

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message)

            switch (data.type) {
                case 'joinGame':
                    const added = addPlayerToRoom(playerId, data.nickname)

                    if (added) {
                        ws.send(JSON.stringify({
                            type: 'joinedRoom',
                            players: activeRoom.players,
                            playerCount: activeRoom.playerCount,

                        }))

                        broadcastToOthers(ws, {
                            type: 'playerJoined',
                            player: activeRoom.players[playerId]
                        })
                    } else {
                        ws.send(JSON.stringify({
                            type: 'error',
                            message: 'Could not join game. Room is full.'
                        }))
                    }
                    break
                case 'chatMessage':
                    handleChatMessage(playerId, data);
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error)
        }
    })

    ws.on('close', () => {
        handleDisconnect(playerId)
        delete clients[playerId]
    });
})

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
})