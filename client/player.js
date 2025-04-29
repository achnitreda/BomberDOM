import { store } from "./game.js"
import { Bomb } from "./bomb.js"
export class Player {
    constructor(x, y, size, roomId, name, avatar) {
        this.element = null

        this.position = {
            x: x,
            y: y
        }
        this.size = size
        this.roomId = roomId
        this.name = name
        this.moveKeys = []
        this.avatar = avatar
        this.sprite = {
            framesize: this.size,
            currentFrame: 0,
            frameCount: 4,
            lastUpdate: 0,
            animationSpeed: 80,
            direction: {
                ArrowDown: 0,
                ArrowLeft: avatar == "sadako" ? size * 2 : size,
                ArrowRight: avatar == "sadako" ? size : size * 2,
                ArrowUp: size * 3
            }

        }
        this.bombsCount = 1
        this.bombs = []
        this.bombRange = 1



    }

    createBomb() {
        if (this.bombs.length < this.bombsCount) {
            const i = Math.trunc((this.position.y + (this.size *0.5))/this.size)
            const j = Math.trunc((this.position.x + (this.size *0.5))/this.size)
            const div = document.getElementById(`${i}#${j}`) 
            const b = new Bomb(i, j, this.size, div, this)
            this.bombs.push(b)
            div.style.backgroundSize = `${5 * this.size}px, ${this.size}px`;
            div.classList.add("bomb");
        }
    }

    bgResize() {
        this.element.style.backgroundSize = `${this.size * 4}px ${this.size * 4}px`;
        this.element.style.backgroundImage = `url(./images/${this.avatar}.png)`
    }

    ArrowRight() {
        const newR = Math.trunc((this.position.y + (0.5 * this.size)) / this.size) * this.size
        if ((Math.abs(newR - this.position.y)) > store.getState().speed) {
            this.position.y += newR > this.position.y ? store.getState().speed : -store.getState().speed;
            return
        }
        this.position.y = newR
        if (this.canMove("h", 1, 1)) {
            this.position.x += store.getState().speed
        }
    }

    ArrowLeft() {
        const newR = Math.trunc((this.position.y + (0.5 * this.size)) / this.size) * this.size
        if ((Math.abs(newR - this.position.y)) > store.getState().speed) {
            this.position.y += newR > this.position.y ? store.getState().speed : -store.getState().speed;
            return
        }
        this.position.y = newR
        if (this.canMove("h", 0, -1)) {
            this.position.x -= store.getState().speed;
        }
    }

    ArrowUp() {
        const newC = Math.trunc((this.position.x + (0.5 * this.size)) / this.size) * this.size
        if ((Math.abs(newC - this.position.x)) > store.getState().speed) {
            this.position.x += newC > this.position.x ? store.getState().speed : -store.getState().speed;
            return
        }
        this.position.x = newC
        if (this.canMove("v", 0, -1)) {
            this.position.y -= store.getState().speed;
        }
    }

    ArrowDown() {
        const newC = Math.trunc((this.position.x + (0.5 * this.size)) / this.size) * this.size
        if ((Math.abs(newC - this.position.x)) > store.getState().speed) {
            this.position.x += newC > this.position.x ? store.getState().speed : -store.getState().speed;
            return
        }
        this.position.x = newC
        if (this.canMove("v", 1, 1)) {
            this.position.y += store.getState().speed;
        }
    }

    canMove(dir, v, x) {
        if (dir == "h") {
            return store.getState().room.map[Math.trunc(((this.position.y + (this.size * 0.5)) / this.size))][Math.trunc(((this.position.x + (this.size * v) + (store.getState().speed * x)) / this.size))] == 0
        } else {
            return store.getState().room.map[Math.trunc(((this.position.y + (this.size * v) + (store.getState().speed * x)) / this.size))][Math.trunc(((this.position.x + (this.size * 0.5)) / this.size))] == 0
        }
    }

    renderMovement() {
        this.element.style.transform = `translate(${this.position.x}px, ${this.position.y}px)`;
    }

    moveAnimate(currentTime, dir) {
        if (currentTime - this.sprite.lastUpdate > this.sprite.animationSpeed) {
            this.sprite.currentFrame = (this.sprite.currentFrame + 1) % this.sprite.frameCount;
            this.sprite.lastUpdate = currentTime;

            const x = this.sprite.currentFrame * this.sprite.framesize;
            const y = this.sprite.direction[dir];
            this.element.style.backgroundPosition = `-${x}px -${y}px`;
        }
    }

    _sendPosition(dir, event) {
        // console.log("xxxxxx");
        const msg = {
            type: "movement",
            event,
            dir,
            amount: [this.position.x / (this.size), this.position.y / (this.size)],
            room_id: this.roomId,
            name: this.name
        }
        // console.log(this.size/0.8);

        store.getState().ws.send(JSON.stringify(msg))
    }
}