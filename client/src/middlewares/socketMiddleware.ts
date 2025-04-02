import { Middleware } from "@reduxjs/toolkit";
import { Commands } from '@shared/MiddlewareCommands'

import {
    connectionEstablished,
    connectionLost,
    disconnect,
    initSocket,
} from '@features/socket/socketSlice'
import SocketFactory from "@features/socket/SocketFactory";
import type { SocketInterface } from "@features/socket/SocketFactory";
import { handleSearch, insertNewMessage, reqList, search, setList } from "@features/chatList/chatListSlicer";
import { handleNewMessage, reqData, reqDataByUser, reqMsgs, setData, setMsgs } from "@features/chatView/chatViewSlice";
import { send, sendTyping } from "@features/sender/senderSlice";
import { receiveTyping, setHeaderInfo } from "@features/header/headerSlice";
import { createGroup, reqContacts, setContacts } from "@features/group/groupSlice";

import { ChatListItem, ChatMessage, ChatSelectRes, 
    ContactItem, SendRes, Typing, TypingInChat } from "@shared/Types";

import { handleSelection } from "../ChatPage/components/ChatList/slice";
import { handleTyping } from "../ChatPage/components/ChatView/slice";
import { sendNumber } from "../ChatPage/slice";

enum SocketEvent {
    Connect = 'connect',
    Disconnect = 'disconnect',
}


const socketMiddleware: Middleware = (store) => {
    let socket: SocketInterface

    return (next) => (action) => {


        if(initSocket.match(action)) {

            // console.log('socket')
            // if(!socket && typeof window !== 'undefined'){
            if(!socket){
                socket = SocketFactory.create()

                socket.socket.on(Commands.ChatListRes, (arg: ChatListItem[]) => {
                    store.dispatch(setList(arg))
                })

                socket.socket.on(Commands.SearchRes, (arg: ContactItem[]) => {
                    store.dispatch(handleSearch(arg))
                })

                socket.socket.on(Commands.ChatSelectionRes, (arg: ChatSelectRes) => {
                    store.dispatch(setData(arg))
                    store.dispatch(setHeaderInfo(arg))
                })

                socket.socket.on(Commands.ChatMsgRes, (msgs: ChatMessage[]) => {
                    store.dispatch(setMsgs(msgs))
                })

                socket.socket.on(Commands.SendRes, (msg: SendRes) => {
                    // to chatview
                    store.dispatch(handleNewMessage(msg))
                    // to chatlist
                    store.dispatch(insertNewMessage(msg as ChatMessage)) // todo fix
                })

                socket.socket.on(Commands.TypingRes, (res: TypingInChat) => {
                    store.dispatch(handleTyping(res))
                })

                socket.socket.on(Commands.ContactsRes, (res: ContactItem[]) => {
                    store.dispatch(setContacts(res))
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


        if(sendNumber.match(action) && socket){
            console.log('sending number')
            socket.socket.emit('number', action.payload)
        } 

        if(handleSelection.match(action) && socket){
            console.log('heeey')
            socket.socket.emit('fetching', action.payload)
        } 

        if(reqList.match(action) && socket){
            socket.socket.emit(Commands.ChatListReq, action.payload)
        }

        if(search.match(action) && socket){
            socket.socket.emit(Commands.SearchReq, action.payload)
        }

        if(reqData.match(action) && socket){
            socket.socket.emit(Commands.ChatSelectionReq, action.payload)
        }

        if(reqDataByUser.match(action) && socket){
            socket.socket.emit(Commands.ChatSelectionWithUser, action.payload)
        }

        if(reqMsgs.match(action) && socket){
            socket.socket.emit(Commands.ChatMsgReq, action.payload)
        }

        if(send.match(action) && socket){
            socket.socket.emit(Commands.SendReq, action.payload)
        }

        if(sendTyping.match(action) && socket){
            socket.socket.emit(Commands.TypingReq, action.payload)
        }

        if(reqContacts.match(action) && socket){
            socket.socket.emit(Commands.ContactsReq, '')
        }

        if(createGroup.match(action) && socket){
            socket.socket.emit(Commands.NewGroupReq, action.payload)
        }

        return next(action)
    }

}

export default socketMiddleware