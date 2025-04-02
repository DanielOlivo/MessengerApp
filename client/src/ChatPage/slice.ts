import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { ChatData, ChatId, ChatPinStatus, MessageId, MessagePost, MessagePostReq, Typing, UserData, UserId } from "@shared/Types";
import { Message } from "shared/src/Message";
import { TextMessageProps } from "./components/ChatView/components/TextMessage/TextMessage";
import { MessageStatusUpdate } from "@shared/Types";

export type ContainerItem = TextMessageProps

export interface ChatInfo {
    name: string
    iconSrc: string
    status: string // (n) online | offline 
}

export interface ChatSliceState {
    chatMessageIds: { [P: ChatId]: MessageId[]}
    chatInfo: { [P in ChatId]: ChatInfo}
    messages: { [P in MessageId] : Message}
    unseenCount: { [P in ChatId] : number}
    pinned: ChatId[],
    displayedChatId: ChatId,
    typing: {[P in ChatId]: {[U in UserId]: number}}
    users: {[P in UserId]: string} // usernames
}

const initialState: ChatSliceState = {
    chatMessageIds: {},
    chatInfo: {},
    messages: {},
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

        // --------------- users ---------------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        requestUserInfo: (state, action: PayloadAction<UserId>) => {},

        handleUser: (state, action: PayloadAction<UserData>) => {
            const { id, username } = action.payload
            state.users[id] = username
        },


        // --------------- chats ---------------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleAllChats: (state, action) => {
            // todo
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleChatUpdate: (state, action: PayloadAction<ChatData>) => {
            // todo
        },

        handleChatDelete: (state, action: PayloadAction<ChatId>) => {
            delete state.chatMessageIds[action.payload]
        },


        // ------------------ toggle pin ------------------------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        togglePin: (state, action: PayloadAction<ChatId>) => {},
        
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

        handleMessage: (state, action: PayloadAction<MessagePost>) => {
            const { chatId, userId, messageId, content, timestamp } = action.payload

            state.messages[messageId] ={
                messageId, chatId, sender: userId, timestamp, content
            }
            state.chatMessageIds[chatId] = [messageId].concat(state.chatMessageIds[chatId])
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



        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        handleChatSelection: (state, action: PayloadAction<ChatId>) => {
            // todo
        },


        // --------------- typing -------------------

        /** send when user starts typing in ChatInput */

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sendTyping: (state, action: PayloadAction<ChatId>) => {},

        handleTyping: (state, action: PayloadAction<Typing>) => {
            const { chatId, userId, timestamp } = action.payload
            state.typing[chatId][userId] = timestamp 
        },

        // ----------------- testing ---------------

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        sendNumber: (state, action: PayloadAction<number>) => {}
    }
})

export const {
    handleMessageStatusUpdate, 
    handleMessage, sendMessage,
    togglePin, handleToggle,
    sendTyping, handleTyping,
    sendNumber
} = slice.actions

export default slice.reducer
