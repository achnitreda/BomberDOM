import http  from "http"
import fs  from "fs"
import path  from "path"
import { WebSocketServer } from "ws"

const server = http.createServer((req, res) => {
    const pathName = "public" + (req.url == "/" ? "/index.html" : req.url); 
    const fExt = path.extname(pathName);
    let contentType = "text/html"

    switch(fExt) {
        case ".js": contentType = "text/javascript"; break;
        case ".css": contentType = "text/css"; break;
        case ".png": contentType = "image/png"; break;
        case ".jpg": contentType = "image/jpg"; break;

    }
    
    fs.readFile(pathName, (err, content) => {
        if (err) {
            res.writeHead(404)
            res.end("404 Page Not Found")
        } else {
            res.writeHead(200,{"Content-Type": contentType})
            res.end(content)
        }
    })
})

const wsServer = new WebSocketServer({server})

wsServer.on("connection", (ws) => {
    console.log("connected!! =>");
    
    ws.on("message", (msg) => {
        console.log(msg.toString());
    })

    ws.send("welcom!!!!!!!!!!!!!!")

    ws.on("close", () => {
        console.log("connection closed!!!!!!");
    })
})

server.listen(3000, "", () => {
    console.log("server started at http://localhost:3000");
})