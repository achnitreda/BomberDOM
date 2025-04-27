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
        this.position.x += 2
        this._sendPosition(2, 0)
    }

    moveLeft() {
        this.position.x -= 2
        this._sendPosition(-2, 0)
    }

    moveUp() {
        this.position.y -= 2
        this._sendPosition(0, -2)
    }

    moveDown() {
        this.position.y += 2
        this._sendPosition(0, 2)
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

