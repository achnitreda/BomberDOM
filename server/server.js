import http from 'http'
import fs from 'fs'
import path from 'path'
import { WebSocket, WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid';

// Multiple Rooms Logic
let gameRooms = {}
let roomCounter = 1;

function createNewRoom() {
    const roomId = `room_${roomCounter++}`;
    gameRooms[roomId] = {
        id: roomId,
        playerCount: 0,
        players: {},
        state: 'waiting',
        countdown: null,
        countdownInterval: null,
        grid: null,
    }
    return roomId
}

function findAvailableRoom() {
    for (let roomId in gameRooms) {
        const room = gameRooms[roomId]
        if (room.state === 'waiting' && room.playerCount < 4) {
            return roomId
        }
    }
    return null
}

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

function startCountdown(roomId) {
    const room = gameRooms[roomId]

    if (room.state !== 'waiting') return

    room.state = 'countdown'
    room.countdown = 2

    broadcastToAll(roomId, {
        type: 'countdown',
        countdown: room.countdown,
        isWaiting: false
    })

    room.countdownInterval = setInterval(() => {
        room.countdown--

        if (room.countdown <= 0) {
            clearInterval(room.countdownInterval)
            startGame(roomId)
        } else {
            broadcastToAll(roomId, {
                type: 'countdown',
                countdown: room.countdown,
                isWaiting: false
            })
        }
    }, 1000)
}

function startGame(roomId) {
    const room = gameRooms[roomId];

    room.state = 'playing'

    const map = generateMap()
    room.grid = map

    broadcastToAll(roomId, {
        type: 'gameStart',
        players: room.players,
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

function addPlayerToRoom(roomId, playerId, nickname) {
    const room = gameRooms[roomId];

    if (room.playerCount >= 4) {
        return { success: false, error: 'room_full' }
    }

    const isNicknameTaken = Object.values(room.players).some((player) => player.nickname.toLowerCase() === nickname.toLowerCase())

    if (isNicknameTaken) {
        return { success: false, error: 'nickname_taken' };
    }

    const positions = [
        { i: 1, j: 1 },        // Top-left
        { i: 1, j: 13 },       // Top-right
        { i: 11, j: 1 },       // Bottom-left
        { i: 11, j: 13 }       // Bottom-right
    ];

    const posIndex = room.playerCount;

    room.players[playerId] = {
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

    room.playerCount++

    if (room.playerCount === 4) {
        startCountdown(roomId)
    } else if (room.playerCount >= 2 && !room.countdownInterval && room.state === 'waiting') {
        let waitTime = 5;

        broadcastToAll(roomId, {
            type: 'countdown',
            countdown: waitTime,
            isWaiting: true
        });

        room.countdownInterval = setInterval(() => {
            waitTime--;

            broadcastToAll(roomId, {
                type: 'countdown',
                countdown: waitTime,
                isWaiting: true
            });

            if (waitTime <= 0) {
                clearInterval(room.countdownInterval);
                room.countdownInterval = null;

                if (room.state === 'waiting' && room.playerCount >= 2) {
                    startCountdown(roomId);
                }
            }
        }, 1000);

    }
    return { success: true }
}

function removePlayerFromRoom(roomId, playerId) {
    const room = gameRooms[roomId];

    if (!room || !room.players[playerId]) return false;

    delete room.players[playerId];
    room.playerCount--;

    broadcastToAll(roomId, {
        type: 'playerLeft',
        playerId,
    });

    if (room.playerCount < 2) {
        if (room.countdownInterval) {
            clearInterval(room.countdownInterval);
            room.countdownInterval = null;
        }

        room.state = 'waiting';

        broadcastToAll(roomId, {
            type: 'countdownCancelled'
        });
    }

    if (room.playerCount === 0) {
        resetRoom(roomId);
    }

    return true
}

function broadcastToOthers(roomId, sender, message) {
    wss.clients.forEach(client => {
        if (client !== sender && client.roomId === roomId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}

function broadcastToAll(roomId, message) {
    wss.clients.forEach(client => {
        if (client.roomId === roomId && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(message))
        }
    })
}

function handleDisconnect(ws, playerId) {

    const roomId = ws.roomId;

    if (!roomId || !playerId) return;

    removePlayerFromRoom(roomId, playerId);
}

function resetRoom(roomId) {
    let room = gameRooms[roomId]
    if (room.countdownInterval) {
        clearInterval(room.countdownInterval);
    }

    room = {
        playerCount: 0,
        players: {},
        state: 'waiting',
        countdown: null,
        countdownInterval: null,
        grid: null,
    }

    broadcastToAll(roomId, {
        type: 'roomReset'
    })
}

function handleChatMessage(ws, playerId, data) {
    const roomId = ws.roomId;

    const room = gameRooms[roomId]

    if (roomId || !room.players[playerId]) return

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
        sender: room.players[playerId].nickname,
        message: data.message,
        timestamp: Date.now()
    };

    broadcastToAll(roomId, message)
}

function handleJoinGame(ws, nickname, playerId) {

    let roomId = findAvailableRoom()
    if (!roomId) {
        roomId = createNewRoom();
    }

    const result = addPlayerToRoom(roomId, playerId, nickname)

    if (result.success) {

        ws.roomId = roomId

        ws.send(JSON.stringify({
            type: 'joinedRoom',
            roomId: roomId,
            players: gameRooms[roomId].players,
            playerCount: gameRooms[roomId].playerCount,

        }))

        broadcastToOthers(roomId, ws, {
            type: 'playerJoined',
            player: gameRooms[roomId].players[playerId]
        })
    } else {
        ws.send(JSON.stringify({
            type: 'error',
            error: result.error,
            message: result.error === 'nickname_taken' ?
                'This nickname is already taken in this room.' :
                'Could not join game. Room is full.'
        }));
    }
}

// Setup Websocket server
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
    console.log('Client connected')

    const playerId = uuidv4()

    ws.send(JSON.stringify({
        type: 'playerId',
        playerId
    }))

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message)

            switch (data.type) {
                case 'joinGame':
                    handleJoinGame(ws, data.nickname, playerId)
                    break
                case 'chatMessage':
                    handleChatMessage(ws, playerId, data);
                    break;
            }
        } catch (error) {
            console.error('Error processing message:', error)
        }
    })

    ws.on('close', () => {
        handleDisconnect(ws, playerId)
    });
})

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
})