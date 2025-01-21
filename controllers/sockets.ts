import { Socket } from "socket.io"
import { UserId } from "../types/Types"

class Sockets {
    private _sockets: {[userId: UserId]: Socket} = {}

    add(userId: UserId, socket: Socket){
        this._sockets[userId] = socket
    }

    getSocket(userId: UserId){
        return this._sockets[userId]
    }
}

export default Sockets