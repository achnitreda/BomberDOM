import http from "http"
import fs from "fs"
import path from "path"
import { WebSocketServer } from "ws"
import { RoomsManager, Player } from "./roomsManager.js"

// const playerMap = new Map();  // key: ws, value: player
// const roomMap = new Map();    // key: roomId, value: room


const server = http.createServer((req, res) => {
    let filePath = `../client${req.url}`
    if (req.url === '/') {
        filePath = '../client/index.html'
    }

    const extname = path.extname(filePath)

    let contentType = 'text/html'

    switch (extname) {
        case '.js': contentType = 'text/javascript'; break;
        case '.css': contentType = 'text/css'; break;
        case '.json': contentType = 'application/json'; break;
        case '.png': contentType = 'image/png'; break;
        case '.jpg': contentType = 'image/jpg'; break;
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

const wsServer = new WebSocketServer({ server })

wsServer.on("connection", (ws) => {
    let room
    let player
    ws.on("message", (msg) => {
        const data = JSON.parse(msg);
        switch (data.type) {
            case "join":
                const name = data.u_name.trim()
                if (!name) return
                room = RoomsManager.getAvailbelRooms();

                if (room.nameExist(name)) {
                    const msg = {
                        type: "name taken"
                    }
                    ws.send(JSON.stringify(msg))
                    return
                }
                player = new Player(name, ws, room.id)
                room.players.push(player)

                // playerMap.set(ws, player)
                // roomMap.set(room.id, room)

                room.broadcast({
                    type: "waiting room update",
                    payload: {
                        players: room.players.map(p => p.nickname),
                        playerCount: room.players.length
                    }
                })

                if (room.players.length >= 2 && room.status === "open") {
                    room.startWaitingCountdown();
                }

                break;
            case 'chatMessage':

                // const p = playerMap.get(ws);
                // const r = roomMap.get(p.roomId);
                // if (!p || !r) return
                // console.log("chatMessage", data);

                // console.log(room, player, data.text);
                
                
                if (room && player && typeof data.text === 'string') {
                    room.sendChatMessage(player.nickname, data.text.trim());
                }
                break;

        }
    })

    ws.on("close", () => {
        console.log("connection closed!!!!!!");
    })
})

server.listen(3000, "", () => {
    console.log("server started at http://localhost:3000");
})