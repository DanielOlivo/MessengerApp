import { Socket } from "socket.io"
import { UserId } from "@shared/Types"

class Sockets {
    private _sockets: {[userId: UserId]: Socket} = {}

    add(userId: UserId, socket: Socket){
        this._sockets[userId] = socket
    }

    getSocket(userId: UserId){
        if(userId in this._sockets){
            return this._sockets[userId]
        }
        return undefined
    }
}

export default Sockets