import http  from "http"
import fs  from "fs"
import path  from "path"

const server = http.createServer((req, res) => {
    const pathName = "public" + (req.url == "/" ? "/index.html" : req.url); 
    const fExt = path.extname(pathName);
    let contentType = "text/html"
console.log(pathName);

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

server.listen(3000, "", () => {
    console.log("server started at http://localhost:3000");
})