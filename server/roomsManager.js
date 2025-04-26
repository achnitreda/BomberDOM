class Room {
    constructor(id) {
        this.id = id
        this.players = []
        this.messages = []
        this.status = 'open'
    }

    nameExist(u_name) {
        return this.players.some(player => player.nickname == u_name)
    }
}

export const RoomsManager = {
    rooms: [],
    getAvailbelRooms() {
        console.log("rooms len =>",this.rooms.length);
        
        for (const room of this.rooms) {
            console.log("room =>",room);
            
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
