import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { ChatId, ChatPinStatus, MessageId, Typing, UserData, UserId } from "@shared/Types";
import { Message, MessagePostReq } from "shared/src/Message";
import { TextMessageProps } from "./components/ChatView/components/TextMessage/TextMessage";
import { MessageStatusUpdate } from "@shared/Types";
import { GroupCreateRes } from "shared/src/ChatControl";

import { addInputHandler, addOutputHandler } from "../utils/socketActions";
import { EditChanges } from "../ChatControl/slice";
import { Commands } from "shared/src/MiddlewareCommands";

export type ContainerItem = TextMessageProps

export interface ChatInfo {
    name: string
    iconSrc: string
    status: string // (n) online | offline 
    isGroup: boolean
}

export interface ChatData {
    chatId: ChatId
    info: ChatInfo
    chatMessageIds: { [P: ChatId]: MessageId[]}
    messages: { [P in MessageId] : Message}
    members: UserId[]
    admins: UserId[]
}

// export interface ChatUpdate {
//     chatId: ChatId
//     name: string
//     members: UserId[]
//     admins: UserId[]
// }

export interface ChatSliceState {
    chatMessageIds: { [P: ChatId]: MessageId[]}
    chatInfo: { [P in ChatId]: ChatInfo}
    messages: { [P in MessageId] : Message}
    unseenCount: { [P in ChatId] : number}
    members: { [P: ChatId]: UserId[]}
    admins: { [P: ChatId]: UserId[] }
    pinned: ChatId[],
    displayedChatId: ChatId,
    typing: {[P in ChatId]: {[U in UserId]: number}}
    users: {[P in UserId]: string} // usernames
}

const initialState: ChatSliceState = {
    chatMessageIds: {},
    chatInfo: {},
    messages: {},
    members: {},
    admins: {},
    unseenCount: {},
    pinned: [],
    displayedChatId: '',
    typing: {},
    users: {}
}

const slice = createSlice({
    name: 'chat',
    initialState,
    reducers: {

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        initLoading: (state) => {},

        handleInitLoading: (state, action: PayloadAction<ChatSliceState>) => {
            // return action.payload
            // console.log(action.payload)
            const { chatInfo, chatMessageIds, messages, pinned } = action.payload
            state.chatInfo = chatInfo
            state.chatMessageIds = chatMessageIds
            state.displayedChatId = '' 
            state.messages = messages
            state.pinned = pinned
        },

        // --------------- users ---------------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        requestUserInfo: (state, action: PayloadAction<UserId>) => {},

        handleUser: (state, action: PayloadAction<UserData>) => {
            const { id, username } = action.payload
            state.users[id] = username
        },


        // --------------- chats ---------------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleAllChats: (state, action) => {},


        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        reqChatWithUser: (state, action: PayloadAction<UserId>) => {},

        handleChatWithUser: (state, action: PayloadAction<ChatData>) => {
            const { chatId, info, messages, chatMessageIds } = action.payload
            state.displayedChatId = chatId
            state.chatInfo[chatId] = info
            state.messages = {...state.messages, ...messages}
            state.chatMessageIds = {
                ...state.chatMessageIds,
                ...chatMessageIds
            }
        },

        handleChatDelete: (state, action: PayloadAction<ChatId>) => {
            delete state.chatMessageIds[action.payload]
        },


        handleGroupCreate: (state, action: PayloadAction<GroupCreateRes>) => {
            const { name, members, admins, id, chatMessageIds, messages } = action.payload

            state.chatInfo[id] =  {
                name,
                iconSrc: '',
                status: 'group',
                isGroup: true
            }

            state.messages = {
                ...state.messages,
                ...messages
            }

            state.members[id] = members
            state.admins[id] = admins

            state.chatMessageIds[id] = chatMessageIds
        },

        handleChatEdit: (state, action: PayloadAction<EditChanges>) => {
            const { chatId, name, members, admins } = action.payload
            state.chatInfo[chatId].name = name
            state.members[chatId] = members
            state.admins[chatId] = admins
        },

        // ------------------ toggle pin ------------------------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        togglePin: (state, action: PayloadAction<ChatId>) => {},

        // handleTogglePin: (state, action: PayloadAction<{chatId: ChatId, pinned: boolean}>) => {
        //     const { chatId, pinned } = action.payload
        //     if(pinned){
        //         state.pinned.push(chatId)
        //     }
        //     else {
        //         state.pinned = state.pinned.filter(id => id !== chatId)
        //     }
        // },
        
        handleToggle: (state, action: PayloadAction<ChatPinStatus>) => {
            const { chatId, pinned } = action.payload
            if(pinned){
                state.pinned.push(chatId)
                return
            }

            state.pinned = state.pinned.filter(id => id !== chatId)
        },

        // ----------------- messages -------------------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sendMessage: (state, action: PayloadAction<MessagePostReq>) => {},

        handleMessage: (state, action: PayloadAction<Message>) => {
            console.log('------------- handling message ---------------')
            const { chatId, sender: userId, messageId, content, timestamp } = action.payload

            state.messages[messageId] ={
                messageId, chatId, sender: userId, timestamp, content
            }
            // state.chatMessageIds[chatId] = [messageId].concat(state.chatMessageIds[chatId])
            state.chatMessageIds[chatId].unshift(messageId)
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadAllMessagesAfter: (state, action: PayloadAction<MessageId>) => {},

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        loadMessagesBefore: (state, action: PayloadAction<MessageId>) => {},

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sendMessageStatus: (state, action: PayloadAction<string>) => {},

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleMessageStatusUpdate: (state, action: PayloadAction<MessageStatusUpdate>) => {
            // todo
        },

        handleChatSelection: (state, action: PayloadAction<ChatId>) => {
            state.displayedChatId = action.payload
        },


        // --------------- typing -------------------

        /** send when user starts typing in ChatInput */

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sendTyping: (state, action: PayloadAction<ChatId>) => {},

        handleTyping: (state, action: PayloadAction<Typing>) => {
            const { chatId, userId, timestamp } = action.payload
            if(!state.typing[chatId]){
                state.typing[chatId] = {} // as { [P: UserId]: number } 
            }
            state.typing[chatId][userId] = timestamp 
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        deleteChat: (state, action: PayloadAction<ChatId>) => {},

        handleChatDeletion: (state, action: PayloadAction<ChatId>) => {
            const chatId = action.payload
            if(chatId in state.chatMessageIds){
                for(const msgId of state.chatMessageIds[chatId]){
                    delete state.messages[msgId]
                }
                delete state.chatMessageIds[chatId]
            }
            if(chatId in state.chatInfo){
                delete state.chatInfo[chatId]
            }
            if(chatId in state.typing){
                delete state.typing[chatId]
            }
            state.pinned = state.pinned.filter(id => id !== chatId)
        },

        // ----------------- testing ---------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sendNumber: (state, action: PayloadAction<number>) => {}
    }
})

export const {
    initLoading, handleInitLoading,
    handleMessageStatusUpdate, 
    handleMessage, sendMessage,
    handleGroupCreate,
    handleChatEdit,
    reqChatWithUser, handleChatWithUser,
    togglePin, handleToggle,
    sendTyping, handleTyping,
    deleteChat, handleChatDeletion,
    sendNumber,
    handleChatSelection
} = slice.actions

export default slice.reducer

addOutputHandler(initLoading, Commands.InitLoadingRequest)
addInputHandler(Commands.InitLoadingResponse, (res: ChatSliceState, store) => store.dispatch(handleInitLoading(res)))

addInputHandler(Commands.TogglePinRes, (args: ChatPinStatus, store) => store.dispatch(handleToggle(args)))
addOutputHandler(togglePin, Commands.TogglePinReq)

addInputHandler(Commands.GroupDeleteRes, (arg: ChatId, store) => store.dispatch(handleChatDeletion(arg)))
addOutputHandler(deleteChat, Commands.GroupDeleteReq)

addOutputHandler(sendMessage, Commands.MessagePostReq)
addInputHandler(Commands.MessagePostRes, (msg: Message, store) => 
    store.dispatch(handleMessage(msg)))

addOutputHandler(reqChatWithUser,Commands.ChatWithUserReq)
addInputHandler(Commands.ChatWithUserRes, (res: ChatData, store) => store.dispatch(handleChatWithUser(res)))

addInputHandler(Commands.GroupCreateRes, (res: GroupCreateRes, store) => store.dispatch(handleGroupCreate(res)))

addInputHandler(Commands.GroupEditRes, (res: EditChanges, store) => store.dispatch(handleChatEdit(res)))