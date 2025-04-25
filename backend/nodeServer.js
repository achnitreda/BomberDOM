const http = require('http');
const WebSocket = require('ws');


const server = http.createServer((req, res) => {
  if (req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' })
    res.end('');
  }
})


const wss = new WebSocket.Server({ server })

const players = new Map()
let countdownTimer = null
let c = 10

function broadcast(data) {
  const m = JSON.stringify(data)
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(m)
    }
  })
}

function startCountdown() {
  if (countdownTimer) return

  countdownTimer = setInterval(() => {
    if (c <= 0) {
      clearInterval(countdownTimer)
      countdownTimer = null
      c = 10

      broadcast({ type: 'start-game' })
    } else {
      broadcast({ type: 'countdown', value: c })
      c--
    }
  }, 1000)
}


wss.on('connection', (ws) => {
  console.log('connected')

  ws.on('message', (message) => {
    const data = JSON.parse(message.toString())

    if (data.type === 'join') {

      if (!data.nickname) {
        return ws.send(JSON.stringify({ type: 'error', message: 'invalid nickname' }));
      }

      players.set(ws, { nickname: data.nickname })

     // console.log(`Player joined: ${data.nickname}`)
      //console.log(`Players online: ${players.size}`)

      broadcast({
        type: 'join',
        nickname: data.nickname,
        pOnline: players.size,
      })

      if (players.size >= 2 && !countdownTimer) {
        startCountdown()
      }
    }
  })

  ws.on('close', () => {
    if (players.has(ws)) {
      //const player = players.get(ws)
      players.delete(ws)
      
    }

    broadcast({ type: 'leave', pOnline: players.size })

    if (players.size < 2 && countdownTimer) {
      clearInterval(countdownTimer)
      countdownTimer = null
      c = 10
      //console.log('c stopped')
    }
  })
})


server.listen(3000, () => {
  console.log('Server running at http://localhost:3000')
})
