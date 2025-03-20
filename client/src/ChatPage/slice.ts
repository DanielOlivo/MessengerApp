import { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { ChatData, ChatId, ChatPinStatus, Message, MessageId, MessagePost, MessagePostReq, Typing, UserData, UserId } from "@shared/Types";
import { TextMessageProps } from "./components/ChatView/components/TextMessage/TextMessage";
import { TypingInChat, MessageStatusUpdate } from "@shared/Types";

export type ContainerItem = TextMessageProps

export interface ChatInfo {
    name: string
    iconSrc: string
    status: string // (n) online | offline 
}

export interface ChatSliceState {
    chatMessageIds: { [P in ChatId]: MessageId[]}
    chatInfo: { [P in ChatId]: ChatInfo}
    messages: { [P in MessageId] : TextMessageProps}
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
        requestUserInfo: (state, action: PayloadAction<UserId>) => {},

        handleUser: (state, action: PayloadAction<UserData>) => {
            const { id, username } = action.payload
            state.users[id] = username
        },


        // --------------- chats ---------------------
        handleAllChats: (state, action) => {
            // todo
        },

        handleChatUpdate: (state, action: PayloadAction<ChatData>) => {
            // todo
        },

        handleChatDelete: (state, action: PayloadAction<ChatId>) => {
            delete state.chatMessageIds[action.payload]
        },


        // ------------------ toggle pin ------------------------------
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
        sendMessage: (state, action: PayloadAction<MessagePostReq>) => {},

        handleMessage: (state, action: PayloadAction<MessagePost>) => {
            const { chatId, userId, messageId, content, timestamp } = action.payload
            state.messages[messageId].push({
                id: messageId, chatId, userId, created: timestamp, content
            })
            state.chatMessageIds[chatId] = [messageId].concat(state.chatMessageIds[chatId])
        },

        loadAllMessagesAfter: (state, action: PayloadAction<MessageId>) => {},
        loadMessagesBefore: (state, action: PayloadAction<MessageId>) => {},

        sendMessageStatus: (state, action: PayloadAction<string>) => {},

        handleMessageStatusUpdate: (state, action: PayloadAction<MessageStatusUpdate>) => {
            // todo
        },



        handleChatSelection: (state, action: PayloadAction<ChatId>) => {
            // todo
        },


        // --------------- typing -------------------

        /** send when user starts typing in ChatInput */
        sendTyping: (state, action: PayloadAction<ChatId>) => {},

        handleTyping: (state, action: PayloadAction<TypingInChat>) => {
            const { chatId, userId, timestamp } = action.payload
            state.typing[chatId][userId] = timestamp 
        }
    }
})

export const {
    handleMessageStatusUpdate, 
    handleMessage, sendMessage,
    togglePin, handleToggle,
    sendTyping, handleTyping
} = slice.actions

export default slice.reducer
