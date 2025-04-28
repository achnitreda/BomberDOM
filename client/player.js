import { store } from "./game.js"

export class Player {
    constructor(x, y, size, roomId, name) {
        this.elment = null
        this.position = {
            x: x,
            y: y
        }
        this.size = size
        this.roomId = roomId
        this.name = name
        this.moveKeys = []
    }

    ArrowRight() {
        // console.log("llll");
        // const speed = spx || store.getState().speed
        // const currR = this.position.y/this.size
        const newR = Math.trunc((this.position.y + (0.55 * this.size))/this.size) * this.size
        // console.log(newR, this.position.y, store.getState().speed);
        
        if ((Math.abs(newR - this.position.y)) > store.getState().speed) {
            this.position.y += newR > this.position.y ? store.getState().speed : -store.getState().speed;
            return
        }
        
        this.position.y = newR
        this.position.x += store.getState().speed;
        // const newX = this.position.x + 2;
        // const newY = this.position.y;
        
        // if (canMove(newX, newY, this.size)) {
        //     this.position.x = newX;
        // this._sendPosition("ArrowRight", "move");
        // }
    }
    
    ArrowLeft(x, y) {

        const newR = Math.trunc((this.position.y + (0.55 * this.size))/this.size) * this.size
        // console.log(newR, this.position.y, store.getState().speed);
        
        if ((Math.abs(newR - this.position.y)) > store.getState().speed) {
            this.position.y += newR > this.position.y ? store.getState().speed : -store.getState().speed;
            return
        }
        // const speed = spx || store.getState().speed
        this.position.x -= store.getState().speed;
        // const newX = this.position.x - 2;
        // const newY = this.position.y;
    
        // if (canMove(newX, newY, this.size)) {
        //     this.position.x = newX;
            // this._sendPosition("ArrowLeft", "move");
        // }
    }
    
    ArrowUp(x,y) {
        const newR = Math.trunc((this.position.x + (0.55 * this.size))/this.size) * this.size
        // console.log(newR, this.position.y, store.getState().speed);
        
        if ((Math.abs(newR - this.position.x)) > store.getState().speed) {
            this.position.x += newR > this.position.x ? store.getState().speed : -store.getState().speed;
            return
        }
        // const speed = spx || store.getState().speed
        this.position.y -= store.getState().speed;
        // const newX = this.position.x;
        // const newY = this.position.y - 2;
    
        // if (canMove(newX, newY, this.size)) {
        //     this.position.y = newY;
            // this._sendPosition("ArrowUp", "move");
        // }
    }
    
    ArrowDown(x, y) {
        // const newR = Math.trunc((this.position.x + (0.55 * this.size))/this.size) * this.size
        // // console.log(newR, this.position.y, store.getState().speed);
        
        // if ((Math.abs(newR - this.position.y)) > store.getState().speed) {
        //     this.position.x += newR > this.position.x ? store.getState().speed : -store.getState().speed;
        //     return
        // }
        // const newX = this.position.x;
        // const speed = spx || store.getState().speed
        this.position.y += store.getState().speed;
    
        // if (canMove(newX, newY, this.size)) {
        //     this.position.y = newY;
            // this._sendPosition("ArrowDown", "move");
        // }
    }
    

    renderMovement() {
        this.elment.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    _sendPosition(dir, event) {
        // console.log("xxxxxx");
        const msg = {
            type: "movement",
            event,
            dir,
            amount: [this.position.x/(this.size), this.position.y/(this.size)],
            room_id: this.roomId,
            name: this.name
        }
        // console.log(this.size/0.8);
        
        store.getState().ws.send(JSON.stringify(msg))
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