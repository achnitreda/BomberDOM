import http  from "http"
import fs  from "fs"
import path  from "path"
import { WebSocketServer } from "ws"
import { RoomsManager, Player } from "./roomsManager.js"

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
        case '.jpg': contentType = 'image/jpg';  break;
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

const wsServer = new WebSocketServer({server})

wsServer.on("connection", (ws) => {
    ws.on("message", (msg) => {
        const data = JSON.parse(msg);
        switch (data.type) {
            case "join":
                const name = data.u_name.trim()
                if (!name) return
                const room = RoomsManager.getAvailbelRooms();
                console.log(room.id);
                
                if (room.nameExist(name)) {
                    console.log("eeeeeeeee");
                    
                    const msg = {
                        type: "name taken"
                    }
                    ws.send(JSON.stringify(msg))
                    return
                }
                const player = new Player(name, ws)
                room.players.push(player)

                const msgToSend = {
                    type: "view change",
                    payload: {
                        view: "game",
                        room
                    }
                }
                ws.send(JSON.stringify(msgToSend))
                
        } 
    })

    ws.on("close", () => {
        console.log("connection closed!!!!!!");
    })
})

server.listen(3000, "", () => {
    console.log("server started at http://localhost:3000");
})