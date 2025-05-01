import { Middleware } from "@reduxjs/toolkit";

import {
    connectionEstablished,
    connectionLost,
    disconnect,
    initSocket,
} from '@features/socket/socketSlice'
import SocketFactory from "@features/socket/SocketFactory";
import type { SocketInterface } from "@features/socket/SocketFactory";

import { inputHandlers, outputHandlers } from "../utils/socketActions";

enum SocketEvent {
    Connect = 'connect',
    Disconnect = 'disconnect',
}


const socketMiddleware: Middleware = (store) => {
    let socket: SocketInterface

    return (next) => (action) => {

        if(initSocket.match(action)) {

            if(!socket){
                socket = SocketFactory.create()

                for(const action of inputHandlers){
                    action(store, socket)
                }

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

        if(disconnect.match(action) && socket){
            socket.socket.disconnect()
        }


        // if(sendNumber.match(action) && socket){
        //     console.log('sending number')
        //     socket.socket.emit('number', action.payload)
        // } 


        for(const handler of outputHandlers){
            handler(action, socket)
        }

        return next(action)
    }

}

export default socketMiddleware