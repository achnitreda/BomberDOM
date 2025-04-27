import { store } from "./game.js"

export class Player {
    constructor(x, y, size, ws, roomId, name) {
        this.elment = null
        this.position = {
            x: x,
            y: y
        }
        this.size = size
        this.ws = ws
        this.roomId = roomId
        this.name = name
    }

    moveRight() {
        const newX = this.position.x + 2;
        const newY = this.position.y;
        
        if (canMove(newX, newY, this.size)) {
            this.position.x = newX;
            this._sendPosition(2, 0);
        }
    }
    
    moveLeft() {
        const newX = this.position.x - 2;
        const newY = this.position.y;
    
        if (canMove(newX, newY, this.size)) {
            this.position.x = newX;
            this._sendPosition(-2, 0);
        }
    }
    
    moveUp() {
        const newX = this.position.x;
        const newY = this.position.y - 2;
    
        if (canMove(newX, newY, this.size)) {
            this.position.y = newY;
            this._sendPosition(0, -2);
        }
    }
    
    moveDown() {
        const newX = this.position.x;
        const newY = this.position.y + 2;
    
        if (canMove(newX, newY, this.size)) {
            this.position.y = newY;
            this._sendPosition(0, 2);
        }
    }
    

    renderMovement() {
        this.elment.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    _sendPosition(x, y) {
        const msg = {
            type: "position",
            position: {x: x, y: y},
            room_id: this.roomId,
            name: this.name
        }
        this.ws.send(JSON.stringify(msg))
    }
}


function canMove(newX, newY, playerSize) {
    
    const left = newX;
    const top = newY;
    const right = newX + playerSize;
    const bottom = newY + playerSize;
    
    const topLeftCell = {
        col: Math.floor(left / playerSize*0.8),
        row: Math.floor(top / playerSize*0.8)
    };
    
    const bottomRightCell = {
        col: Math.floor(right / playerSize*0.8),
        row: Math.floor(bottom / playerSize*0.8)
    };
    
    const map = store.getState().room.map;
    
    if (topLeftCell.row < 0 || topLeftCell.col < 0 || 
        bottomRightCell.row >= map.length || bottomRightCell.col >= map[0].length) {
        return false;
    }
    
    for (let row = topLeftCell.row; row <= bottomRightCell.row; row++) {
        for (let col = topLeftCell.col; col <= bottomRightCell.col; col++) {            
            if (map[row][col] !== 0) {
                return false;
            }
        }
    }
    
    return true;
}