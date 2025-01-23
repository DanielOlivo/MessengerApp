import { Middleware } from "@reduxjs/toolkit";
import { Message } from '../../../types/Types'

// const msg: Message = {

// }

import {
    connectionEstablished,
    connectionLost,
    initSocket,
    joinRoom,
    png, say
} from '../features/socket/socketSlice'
import SocketFactory from "../features/socket/SocketFactory";
import type { SocketInterface } from "../features/socket/SocketFactory";

enum SocketEvent {
    Connect = 'connect',
    Disconnect = 'disconnect',

    // emit
    JoinRoom  = 'join-room',
    LeaveRoom = 'leave-room',
    SAY = 'SAY',

    // on
    Ping = 'PNG',
    Error = 'err',
    Price = 'price' 
}

const socketMiddleware: Middleware = (store) => {
    console.log('IM THE MIDDLEWARE')
    // let socket: SocketInterface = undefined

    // if(!socket){
    //     socket = SocketFactory.create()
    // }

    // let socket = SocketFactory.create() 
    let socket: SocketInterface

    return (next) => (action) => {
        console.log('you are here')
        if(initSocket.match(action)) {
            console.log('hey')

            if(!socket && typeof window !== 'undefined'){
                socket = SocketFactory.create()
                console.log('socket created')

                socket.socket.on(SocketEvent.Ping, () => {
                    console.log('PING')
                })

                socket.socket.on(SocketEvent.Connect, () => {
                    console.log('connected')
                    store.dispatch(connectionEstablished())
                })

                socket.socket.on(SocketEvent.Disconnect, () => {
                    console.log('disconnected')
                    store.dispatch(connectionLost())
                })
            }
            
        }

        if(png.match(action)){
            console.log('PING')
        }

        if(joinRoom.match(action) && socket) {
            console.log('JOIN ROOM')
        }

        if(say.match(action) && socket) {
            socket.socket.emit(SocketEvent.SAY, action.payload)
        }


        console.log('...before next...')
        return next(action)
    }

}

export default socketMiddleware