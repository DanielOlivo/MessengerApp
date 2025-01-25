'use client';

import {io, Socket} from 'socket.io-client';

export interface SocketInterface {
    socket: Socket
}

class SocketConnection implements SocketInterface {
    public socket: Socket
    public socketEndpoint = 'http://localhost:3000'

    constructor(){
        // console.log('SocketConnection.constructor')

        // console.log('import.meta.env', import .meta.env)
        const token = import.meta.env.VITE_USER1 as string
        // console.log('token', token)
        this.socket = io(this.socketEndpoint, {
            auth: {token}
        })
    }
}

let socketConnection: SocketConnection | undefined

class SocketFactory {
    public static create(): SocketConnection {
        if(!socketConnection){
            socketConnection = new SocketConnection()
        }

        return socketConnection;
    }
}

export default SocketFactory;