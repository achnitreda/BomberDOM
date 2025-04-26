class Room {
    constructor(id) {
        this.id = id
        this.players = []
        this.messages = []
        this.map = this.generateMap()
        this.status = 'open'
    }

    nameExist(u_name) {
        return this.players.some(player => player.nickname == u_name)
    }

    generateMap() {
        const map = []
        const width = 15, height = 13
        const empty = 0, soft = 1, solid = 2
    
        for (let i = 0; i < height; i++) {
            map[i] = []
            for (let j = 0; j < width; j++) {
                if (i === 0 || i === height - 1 || j === 0 || j === width - 1) {
                    map[i][j] = solid
                } else if (i % 2 === 0 && j % 2 === 0) {
                    map[i][j] = solid
                } else if ((i <= 2 && j <= 2) ||  // Top-left
                    (i <= 2 && j >= width - 3) ||  // Top-right
                    (i >= height - 3 && j <= 2) ||  // Bottom-left
                    (i >= height - 3 && j >= width - 3)  // Bottom-right
                ) {
                    map[i][j] = empty
                } else {
                    map[i][j] = Math.random() < 0.6 ? empty : soft;
                }
            }
        }
    
        return map
    }
}

export const RoomsManager = {
    rooms: [],
    getAvailbelRooms() {
        for (const room of this.rooms) {
            if (room.status === 'open') {
                return room;
            }
        }
        return this.createRoom()
    },

    createRoom() {
        const id = generateRoomId();
        const room = new Room(id)
        this.rooms.push(room)
        return room
    },

    destroyRoom(id) {
        for (const room of this.rooms) {
            if (room.id === id) {
                this.rooms.splice(index, 1);
            }
        }
    }
}


function generateRoomId() {
    const random = Math.random().toString(36).substr(2, 3);
    const time = Date.now().toString(36).slice(-2);
    return random + time;
}

export class Player {
    constructor(u_name, ws) {
        this.nickname = u_name
        this.ws = ws
    }
}
