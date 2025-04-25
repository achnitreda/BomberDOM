const http = require('http');
const WebSocket = require('ws');

const rooms = new Map()
let roomCounter = 1

function createRoom() {
  const roomId = `room${roomCounter++}`
  const room = {
    id: roomId,
    playerCount: 0,
    players: {},
    state: 'waiting',
    countdown: 10,
    countdownInterval: null,
    waitTimeout: null,
  }
  rooms.set(roomId, room)
  return room
}

function findAvailableRoom() {
  for (const room of rooms.values()) {
    if (room.state === 'waiting' && room.playerCount < 4) {
      return room;
    }
  }
  return createRoom()
}

function broadcast(room, data) {
  const message = JSON.stringify(data)
  for (const id in room.players) {
    const player = room.players[id]
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(message)
    }
  }
}

function startCountdown(room) {
  if (room.countdownInterval) return

  room.state = 'countdown'
  room.countdown = 10

  room.countdownInterval = setInterval(() => {
    if (room.countdown <= 0) {
      clearInterval(room.countdownInterval)
      room.countdownInterval = null
      room.state = 'started'
      broadcast(room, { type: 'start-game' })
      room.countdown = 10
    } else {
      broadcast(room, { type: 'countdown', value: room.countdown })
      room.countdown--
    }
  }, 1000)
}

function stopCountdown(room) {
  if (room.countdownInterval) {
    clearInterval(room.countdownInterval)
    room.countdownInterval = null
    room.countdown = 10
    room.state = 'waiting'
  }
  if (room.waitTimeout) {
    clearTimeout(room.waitTimeout)
    room.waitTimeout = null
  }
}

const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end('')
  }
})

const wss = new WebSocket.Server({ server })

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

wss.on('connection', (ws) => {
  const playerId = generateId()
  let currentRoom = null
  console.log(`Client connected: ${playerId}`)

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString())

    if (data.type === 'join') {
      const nickname = data.nickname?.trim()
      if (!nickname) return

      // Assign player to a room
      currentRoom = findAvailableRoom();

      const usedNick = Object.values(currentRoom.players).some(p => p.nickname === nickname);
      if (usedNick) {
        return ws.send(JSON.stringify({ type: 'error', message: 'nickname already taken' }))
      }

      currentRoom.players[playerId] = { ws, nickname }
      currentRoom.playerCount++

      broadcast(currentRoom, {
        type: 'join',
        nickname,
        pOnline: currentRoom.playerCount
      })

      if (currentRoom.playerCount >= 2 && currentRoom.state === 'waiting' && !currentRoom.waitTimeout) {
        currentRoom.waitTimeout = setTimeout(() => {
          startCountdown(currentRoom)
        }, 20000)
      }
    }

    if (data.type === 'chat' && currentRoom) {
      broadcast(currentRoom, {
        type: 'chat',
        nickname: data.nickname,
        message: data.message.trim()
      })
    }
  })

  ws.on('close', () => {
    if (currentRoom && currentRoom.players[playerId]) {
      delete currentRoom.players[playerId]
      currentRoom.playerCount--
      broadcast(currentRoom, {
        type: 'leave',
        pOnline: currentRoom.playerCount
      })

      if (currentRoom.playerCount < 2 && currentRoom.state === 'countdown') {
        stopCountdown(currentRoom)
      }

      if (currentRoom.playerCount === 0) {
        rooms.delete(currentRoom.id)
      }
    }
  })
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})
