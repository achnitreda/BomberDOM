import http from 'http'
import fs from 'fs'
import path from 'path'
import { WebSocketServer } from 'ws'
import { v4 as uuidv4 } from 'uuid';

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

// Setup Websocket server
const wss = new WebSocketServer({ server })

wss.on('connection', (ws) => {
    // DEBUG
    console.log('Client connected')

    const playerId = uuidv4()

    ws.send(JSON.stringify({
        type: 'playerId',
        playerId
    }))

    ws.on('message', (message) => {
        // Process messages
        console.log(JSON.parse(message))
    })

    ws.on('close', () => {
        // Handle disconnection
    });
})

server.listen(3000, () => {
    console.log('Server running at http://localhost:3000/');
})