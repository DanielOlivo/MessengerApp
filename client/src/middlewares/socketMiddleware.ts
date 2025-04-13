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

import { ChatId, ChatListItem, ChatMessage, ChatPinStatus, ChatSelectRes, 
    ContactItem, SendRes, Typing, 
    UserInfo} from "@shared/Types";

// import { handleSelection } from "../ChatPage/components/ChatList/slice";
// import { handleTyping } from "../ChatPage/components/ChatView/slice";
import { ChatData, ChatSliceState, deleteChat, handleChatDeletion, handleChatWithUser, handleInitLoading, handleToggle, handleTyping, initLoading, reqChatWithUser, sendMessage, sendNumber, sendTyping, togglePin } from "../ChatPage/slice";
import { handleSearch, handleUsers, requestUsers, UserInfoCollection } from "../users/slice";
import { SearchCardProps } from "../ChatPage/components/ChatList/components/SearchCard";
import { search } from "../users/slice";
import { handleSearchContact, searchContact } from "../ChatControl/slice";

import { inputHandlers, outputHandlers } from "../utils/socketActions";

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

                for(const action of inputHandlers){
                    action(store, socket)
                }

                // socket.socket.on('handleUsers', (args: UserInfoCollection) => {
                //     store.dispatch(handleUsers(args))
                // })

                // socket.socket.on('initLoadingRes', (arg: ChatSliceState) => {
                //     store.dispatch(handleInitLoading(arg))
                // })


                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                socket.socket.on(Commands.ChatListRes, (arg: ChatListItem[]) => {
                    // store.dispatch(setList(arg))
                })

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                socket.socket.on(Commands.SearchRes, (arg: ContactItem[]) => {
                    // store.dispatch(handleSearch(arg))
                })

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                socket.socket.on(Commands.ChatSelectionRes, (arg: ChatSelectRes) => {
                    // store.dispatch(setData(arg))
                    // store.dispatch(setHeaderInfo(arg))
                })

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                socket.socket.on(Commands.ChatMsgRes, (msgs: ChatMessage[]) => {
                    // store.dispatch(setMsgs(msgs))
                })

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                socket.socket.on(Commands.SendRes, (msg: SendRes) => {
                    // to chatview
                    // store.dispatch(handleNewMessage(msg))
                    // to chatlist
                    // store.dispatch(insertNewMessage(msg as ChatMessage)) // todo fix
                })

                // socket.socket.on('handleToggle', (res: ChatPinStatus) => {
                //     store.dispatch(handleToggle(res))
                // })

                // socket.socket.on('handleChatDeletion', (res: ChatId) => {
                //     store.dispatch(handleChatDeletion(res))
                // })

                socket.socket.on('handleChatWithUser', (res: ChatData) => {
                    store.dispatch(handleChatWithUser(res))
                })

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                socket.socket.on(Commands.TypingRes, (res: Typing) => {
                    store.dispatch(handleTyping(res))
                })

                // socket.socket.on('handleSearch', (res: UserInfoCollection) => {
                //     store.dispatch(handleSearch(res))
                // })

                // socket.socket.on('handleContactsSearch', (res: UserInfoCollection) => {
                //     store.dispatch(handleUsers(res))
                //     store.dispatch(handleSearchContact(Object.keys(res)))
                // })

                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                socket.socket.on(Commands.ContactsRes, (res: ContactItem[]) => {
                    // store.dispatch(setContacts(res))
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

        // if(requestUsers.match(action) && socket){
        //     socket.socket.emit('requestUsers', '')
        // }

        // if(initLoading.match(action) && socket){
        //     socket.socket.emit('initLoading', '')
        // }

        if(disconnect.match(action) && socket){
            socket.socket.disconnect()
        }


        if(sendNumber.match(action) && socket){
            console.log('sending number')
            socket.socket.emit('number', action.payload)
        } 

        // if(sendMessage.match(action) && socket){
        //     socket.socket.emit('msg', action.payload)
        // }

        for(const handler of outputHandlers){
            handler(action, socket)
        }

        // if(togglePin.match(action) && socket){
        //     socket.socket.emit('togglePin', action.payload)
        // }

        // if(deleteChat.match(action) && socket){
        //     socket.socket.emit('deleteChat', action.payload)
        // }

        if(reqChatWithUser.match(action) && socket){
            socket.socket.emit('reqChatWithUser', action.payload)
        }


        // if(handleSelection.match(action) && socket){
        //     console.log('heeey')
        //     // todo
        //     // socket.socket.emit('fetching', action.payload)
        // } 

        // if(reqList.match(action) && socket){
        //     socket.socket.emit(Commands.ChatListReq, action.payload)
        // }

        // if(search.match(action) && socket){
        //     socket.socket.emit('search', action.payload)
        // }

        // if(searchContact.match(action) && socket){
        //     socket.socket.emit('searchContacts', action.payload)
        // }

        // if(reqData.match(action) && socket){
        //     socket.socket.emit(Commands.ChatSelectionReq, action.payload)
        // }

        // if(reqDataByUser.match(action) && socket){
        //     socket.socket.emit(Commands.ChatSelectionWithUser, action.payload)
        // }

        // if(reqMsgs.match(action) && socket){
        //     socket.socket.emit(Commands.ChatMsgReq, action.payload)
        // }

        // if(send.match(action) && socket){
        //     socket.socket.emit(Commands.SendReq, action.payload)
        // }

        if(sendTyping.match(action) && socket){
            socket.socket.emit(Commands.TypingReq, action.payload)
        }

        // if(reqContacts.match(action) && socket){
        //     socket.socket.emit(Commands.ContactsReq, '')
        // }

        // if(createGroup.match(action) && socket){
        //     socket.socket.emit(Commands.NewGroupReq, action.payload)
        // }

        return next(action)
    }

}

export default socketMiddleware