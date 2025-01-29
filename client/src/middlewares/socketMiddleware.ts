import { createActionCreatorInvariantMiddleware, Middleware } from "@reduxjs/toolkit";
import { Message } from '../../../types/Types'
// import { Commands } from '../../../socketServer'
// import {Commands} from '../../../'
import { Cmd } from '../../../socketServer'

import {
    connectionEstablished,
    connectionLost,
    disconnect,
    initSocket,
    joinRoom,
    png, say
} from '../features/socket/socketSlice'
import SocketFactory from "../features/socket/SocketFactory";
import type { SocketInterface } from "../features/socket/SocketFactory";
import { handleSearch, insertNewMessage, reqList, search, setList } from "../features/chatList/chatListSlicer";
import { handleNewMessage, reqData, reqDataByUser, reqMsgs, setData, setMsgs } from "../features/chatView/chatViewSlice";
import { send, sendTyping } from "../features/sender/senderSlice";
import { receiveTyping, setHeaderInfo } from "../features/header/headerSlice";
import { createGroup, reqContacts, setContacts } from "../features/group/groupSlice";

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

                socket.socket.on('csrs', arg => {
                    console.log('select chat response', arg)
                    store.dispatch(setData(arg))
                    store.dispatch(setHeaderInfo(arg))
                })

                socket.socket.on('cmrs', msgs => {
                    console.log('cmrs', msgs)
                    store.dispatch(setMsgs(msgs))
                })

                socket.socket.on('srs', msg => {
                    console.log('SRS', msg)
                    // to chatview
                    store.dispatch(handleNewMessage(msg))
                    // to chatlist
                    store.dispatch(insertNewMessage(msg))
                })

                socket.socket.on('trs', res => {
                    console.log('typing')
                    store.dispatch(receiveTyping(res))
                })

                socket.socket.on('crs', res => {
                    store.dispatch(setContacts(res))
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

        if(disconnect.match(action) && socket){
            socket.socket.disconnect()
        }

        if(reqList.match(action) && socket){
            console.log('req list')
            socket.socket.emit('clrq', action.payload)
        }

        if(search.match(action) && socket){
            socket.socket.emit('schrq', action.payload)
            // socket.socket.emit(Cmd.SearchReq, action.payload)
        }

        if(reqData.match(action) && socket){
            socket.socket.emit('csrq', action.payload)
        }
        if(reqDataByUser.match(action) && socket){
            console.log('CSWURQ')
            socket.socket.emit('cswurq', action.payload)
        }

        if(reqMsgs.match(action) && socket){
            socket.socket.emit('cmrq', action.payload)
        }

        if(send.match(action) && socket){
            socket.socket.emit('srq', action.payload)
        }

        if(sendTyping.match(action) && socket){
            socket.socket.emit('trq', action.payload)
        }

        if(reqContacts.match(action) && socket){
            socket.socket.emit('crq', '')
        }

        if(createGroup.match(action) && socket){
            socket.socket.emit('ngrq', action.payload)
        }

        // to remove
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