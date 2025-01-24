import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import {user1, users, dms, messages, chats, memberships} from './init'
import { DbUser,ChatId, DM, Message, UserId, MessageId, 
    Group, Membership, MembershipId } from "../../../../types/Types";
import { UserMessageProp } from "../../components/UserMessage";
import { DateMessageProp } from "../../components/DateMessage";

export interface SocketState {
    isConnected: boolean
    rooms: string[]
    msg: string

    user: DbUser

    users: {[userId: UserId]: DbUser}
    chats: {[chatId: ChatId]: DM | Group}
    messages: {[messageId: MessageId]: Message}
    memberships: {[groupId: ChatId]: Membership}

    selectedChat?: ChatId
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
    messages,
    chats,
    memberships
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

export const { selectChat, say, png, initSocket, connectionEstablished, connectionLost, joinRoom } = socketSlice.actions

export const selectStatus = (state: RootState) => state.socket.isConnected

export const selectChatList = (state: RootState) => {
    const {user, users, messages, chats} = state.socket

    const msgs: Message[] = Object.values(messages)
    const groups = Object.groupBy(msgs, (msg) => msg.chatId)
    const limited = Object.fromEntries(
        Object.entries(groups).map(([chatId, msgs]) => [chatId, msgs?.sort(msg => -msg.created)[0]!])
    )
    const withUser = Object.fromEntries(
        Object.entries(limited).map(([chatId, msg]) => [chatId, {msg, user: users[msg!.userId]}])
    )

    const getChatName = (chatId: ChatId) => {
        const _chat = chats[chatId]

        if('name' in _chat) {
            const group: Group = _chat
            return group.name || 'unnamed group';
        }

        if('user1Id' in _chat){
            const dm: DM = _chat
            const otherUserId = user.id == dm.user1Id ? dm.user2Id : dm.user1Id
            const usr = users[otherUserId]
            return usr.username
        }
    }

    const withNames = Object.entries(withUser).map(([chatId, {msg, user}]) => {
        return {chatId, msg, user, name: getChatName(chatId)}}).sort(({msg}) => -msg.created)

    return withNames
}

export const selectChatName = (state: RootState) => {
    const {user, users, chats, selectedChat} = state.socket

    if(!selectedChat){
        return ''
    }

    const getChatName = (chatId: ChatId) => {
        const _chat = chats[chatId]

        if(Object.keys(_chat).includes('name')) {
            const group: Group = _chat
            return group.name || 'unnamed group';
        }

        if(Object.keys(_chat).includes('user1Id')){
            const dm: DM = _chat as DM
            const otherUserId = user.id == dm.user1Id ? dm.user2Id : dm.user1Id
            const usr = users[otherUserId]
            return usr.username
        }
    }

    return getChatName(selectedChat!)
}

export const getGroupMembersAmount = (state: RootState) => {
    const {selectedChat, memberships} = state.socket

    if(!selectedChat){
        return selectedChat
    }

    return Object.values(memberships).filter(member => member.groupId === selectedChat).length
}

export const selectMessages = (state: RootState) => {
    const {user, users, messages, chats, selectedChat} = state.socket

    if(!selectedChat){
        return []
    }

    const msgs = Object.values(messages).filter(msg => msg.chatId === selectedChat)

    function getGroupKey({created}: Message): string {
        return created.toLocaleDateString('en-us', {
            year: 'numeric',
            month: '2-digit',
            day: 'numeric'
        })
    }

    const grouped = Object.groupBy(msgs, msg => getGroupKey(msg))

    const first: (ServiceMessage | DateMessageProp | UserMessageProp)[] = [{msg: 'chat started'}]

    const result: (UserMessageProp | DateMessageProp | ServiceMessage)[] = Object.entries(grouped).reduce((acc, v) => {
        const msgs2 = v[1]?.map(msg => {
            return {
                isOwner: msg.userId === user.id,
                message: msg.content,
                isRead: true // later
            }
        }) as (ServiceMessage | DateMessageProp | UserMessageProp)[]
        const dateMsg: DateMessageProp = {date: new Date(Date.parse(v[0]))}
        return acc.concat([dateMsg]).concat(msgs2)
    }, first)

    return result
}



export default socketSlice.reducer