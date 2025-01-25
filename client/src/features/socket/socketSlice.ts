import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";

// import {user1, users, dms, messages, chats, memberships} from './init'
import {
    user1,
    users, 
    dms, 
    groups,
    messages,
    memberships} from './init2'

import { DbUser,ChatId, DM, Message, UserId, MessageId, 
    Group, Membership, MembershipId } from "../../../../types/Types";
import { UserMessageProp } from "../../components/UserMessage";
import { DateMessageProp } from "../../components/DateMessage";

export interface SocketState {
    isConnected: boolean

    // remained from tutorial
    rooms: string[]
    msg: string

    
    user: DbUser // current user
    users: {[userId: UserId]: DbUser} // contact list

    dms: {[chatId: ChatId]: DM} // dms

    groups: {[chatId: ChatId]: Group} // groups
    memberships: {[groupId: ChatId]: Membership}

    messages: {[messageId: MessageId]: Message}

    selectedChat?: ChatId
    typing: UserId[]
    online: UserId[]

    overlayed: boolean
}

export interface ServiceMessage {
    msg: string
}



const initialState: SocketState = {
    isConnected: false,
    rooms: [],
    msg: '',

    user: user1,
    users,  
    dms, groups,
    messages,
    memberships,

    typing: [],
    online: [],
    overlayed: false
}

type RoomAction = PayloadAction<{room: string}>
type MsgAction = PayloadAction<string>

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        selectChat: (state, action: PayloadAction<string>) => {
            state.selectedChat = action.payload
            console.log('chat selected: ' + state.selectedChat)
        },

        unselectChat: (state) => {
            state.selectedChat = undefined
        },

        removeOverlay: (state) => {
            state.overlayed = false
        },

        initSocket: (state) => {
            console.log('initSocket: ', state)
            return
        },

        connectionEstablished: (state) => {
            state.isConnected = true;
            console.log('connected')
        },

        png: (state) => {
            console.log('PING')
        },

        connectionLost: (state) => {
            state.isConnected = false;
        },

        joinRoom: (state, action: RoomAction) => {
            let room = action.payload.room;
            state.rooms = state.rooms.concat(room)
            return
        },

        say: (state, action: MsgAction) => {
            // state.msg = action.payload.msg
        }
    }
})

export const { selectChat, unselectChat,
    removeOverlay,
    say, png, initSocket, connectionEstablished, connectionLost, joinRoom } = socketSlice.actions
export default socketSlice.reducer