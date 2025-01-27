import { createActionCreatorInvariantMiddleware, Middleware } from "@reduxjs/toolkit";
import { Message } from '../../../types/Types'
import { Commands } from '../../../socketServer'

import {
    connectionEstablished,
    connectionLost,
    initSocket,
    joinRoom,
    png, say
} from '../features/socket/socketSlice'
import SocketFactory from "../features/socket/SocketFactory";
import type { SocketInterface } from "../features/socket/SocketFactory";
import { handleSearch, reqList, search, setList } from "../features/chatList/chatListSlicer";
import { reqMsgs, setMsgs } from "../features/chatView/chatViewSlice";
import { reqHeaderInfo, setInfo } from "../features/header/headerSlice";
import { send } from "../features/sender/senderSlice";

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

                socket.socket.on('clrs', arg => {
                    console.log('clrs ', arg)
                    store.dispatch(setList(arg))
                })

                socket.socket.on('schrs', arg => {
                    store.dispatch(handleSearch(arg))
                })

                socket.socket.on('cmrs', msgs => {
                    console.log('cmrs', msgs)
                    store.dispatch(setMsgs(msgs))
                })

                socket.socket.on('hrs', info => {
                    console.log('hrs', info)
                    store.dispatch(setInfo(info))
                })

                socket.socket.on('srs', msg => {
                    console.log('new msg', msg)
                })


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

        if(reqList.match(action) && socket){
            console.log('req list')
            socket.socket.emit('clrq', action.payload)
        }

        if(search.match(action) && socket){
            socket.socket.emit('schrq', action.payload)
        }

        if(reqMsgs.match(action) && socket){
            socket.socket.emit('cmrq', action.payload)
        }

        if(reqHeaderInfo.match(action) && socket){
            socket.socket.emit('hrq', action.payload)
        }

        if(send.match(action) && socket){
            socket.socket.emit('srq', action.payload)
        }

        if(png.match(action) && socket){
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