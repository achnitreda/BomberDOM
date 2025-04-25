const http = require('http');
const WebSocket = require('ws');

let room = {
  playerCount: 0,
  players: {},               // { clientId: { ws, nickname } }
  state: 'waiting',          // 'waiting' | 'countdown' | 'started'
  countdown: 10,
  countdownInterval: null
};


const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('');
  }
});


const wss = new WebSocket.Server({ server });

function broadcast(data) {
  const message = JSON.stringify(data)
  for (const Id in room.players) {
    const player = room.players[Id]
    if (player.ws.readyState === WebSocket.OPEN) {
      player.ws.send(message)
    }
  }
}


function startCountdown() {
  if (room.countdownInterval) return

  room.state = 'countdown'
  room.countdown = 10

  room.countdownInterval = setInterval(() => {
    if (room.countdown <= 0) {
      clearInterval(room.countdownInterval)
      room.countdownInterval = null
      room.state = 'started'

      broadcast({ type: 'start-game' })
      room.countdown = 10
    } else {
      broadcast({ type: 'countdown', value: room.countdown })
      room.countdown--
    }
  }, 1000);
}


function stopCountdown() {
  if (room.countdownInterval) {
    clearInterval(room.countdownInterval)
    room.countdownInterval = null
    room.countdown = 10
    room.state = 'waiting'
    console.log('Countdown stopped: not enough players')
  }
}

function generateId() {
  return Math.random().toString(36).substring(2, 10)
}

wss.on('connection', (ws) => {
  const playerId = generateId()

  console.log(`Client connected: ${playerId}`)

  ws.on('message', (msg) => {
    const data = JSON.parse(msg.toString())

    if (data.type === 'join') {
      const nickname = data.nickname?.trim()

      if (!nickname) {
        return ws.send(JSON.stringify({ type: 'error', message: 'Invalid nickname' }))
      }

      room.players[playerId] = { ws, nickname }
      room.playerCount++;

      console.log(`Player joined: ${nickname} (ID: ${playerId})`)

      broadcast({
        type: 'join',
        nickname,
        pOnline: room.playerCount
      })

      if (room.playerCount >= 2 && room.state === 'waiting') {
        startCountdown()
      }
    }else if (data.type === 'chat') {
      if (data.message.trim()) {
        broadcast({
          type: 'chat',
          nickname: data.nickname,
          message: data.message.trim()
        })
      }
    }
  })

  ws.on('close', () => {
    if (room.players[playerId]) {
      const nickname = room.players[playerId].nickname
      delete room.players[playerId]
      room.playerCount--;

      console.log(`Player left: ${nickname} (ID: ${playerId})`);

      broadcast({
        type: 'leave',
        pOnline: room.playerCount
      })

      if (room.playerCount < 2 && room.state === 'countdown') {
        stopCountdown()
      }
    }
  })
})

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})
