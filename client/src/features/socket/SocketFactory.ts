'use client';

import {io, Socket} from 'socket.io-client';
import { useAppSelector } from '../../app/hooks';
import { selectToken } from '../auth/selectors';

export interface SocketInterface {
    socket: Socket
}

const url = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

class SocketConnection implements SocketInterface {
    public socket: Socket
    public socketEndpoint = url

    constructor(){
        // console.log('SocketConnection.constructor')

        // console.log('import.meta.env', import .meta.env)
        // const token = import.meta.env.VITE_USER1 as string

        // illegal
        // const token = useAppSelector(selectToken) 

        const token = JSON.parse(localStorage.getItem('token')!)
        console.log('token', token)
        
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