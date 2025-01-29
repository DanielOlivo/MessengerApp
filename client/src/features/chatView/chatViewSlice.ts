import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, ChatSelect, ChatSelectRes, HeaderInfo, SendRes } from "../../types/Client";
import { UserId, ChatId } from "../../types/Client";

export interface ChatViewState {
    userId: UserId
    chatId?: ChatId
    header?: HeaderInfo
    messages?: ChatMessage[]
}

const initialState: ChatViewState = {
    userId: ''
}

export const chatViewSlice = createSlice({
    name: 'chatView',
    initialState,
    reducers: {
        
        reqData: (state, action: PayloadAction<ChatSelect>) => {},
        reqDataByUser: (state, action: PayloadAction<ChatId>) => {},

        setData: (state, action: PayloadAction<ChatSelectRes>) => {
            state.messages = action.payload.messages
            state.header = action.payload.headerInfo
            state.chatId = action.payload.chatId 
        },
        
        resetChatView: (state) => {
            delete state.chatId
            delete state.header
            delete state.messages
        },
        
        handleNewMessage: (state, action: PayloadAction<SendRes>) => {
            const {chatId, userId, username, content, messageId} = action.payload
            if(chatId != state.chatId){
                return
            }

            const newMsg = {messageId, chatId, userId, username, content, created: new Date(), isOwner: false}
            state.messages?.push(newMsg)
        },

        // todo - remove
        reqMsgs: (state, action: PayloadAction<ChatId>) => {},

        setMsgs: (state, action: PayloadAction<ChatMessage[]>) => {
            state.messages = action.payload
        }

    }
})

export const {resetChatView, reqData, reqDataByUser, setData, 
    reqMsgs, setMsgs, handleNewMessage} = chatViewSlice.actions
export default chatViewSlice.reducer