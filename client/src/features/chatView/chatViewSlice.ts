import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, HeaderInfo, SendRes } from "../../../../types/Client";
import { UserId, ChatId } from "../../../../types/Types";

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
        
        setData: (state, action: PayloadAction<{msgs: ChatMessage[], header: HeaderInfo, chatId: ChatId}>) => {
            state.messages = action.payload.msgs
            state.header = action.payload.header
            state.chatId = action.payload.chatId 
        },
        
        reset: (state) => {
            state.messages = undefined
            state.header = undefined
            state.chatId = undefined
        },
        
        handleNewMessage: (state, action: PayloadAction<SendRes>) => {
            const {chatId, userId, username, content} = action.payload
            if(chatId != state.chatId){
                return
            }

            const newMsg = {chatId, userId, username, content, created: new Date(), isOwner: false}
        },

        // todo - remove
        reqMsgs: (state, action: PayloadAction<ChatId>) => {},

        setMsgs: (state, action: PayloadAction<ChatMessage[]>) => {
            state.messages = action.payload
        }

    }
})

export const {reqMsgs, setMsgs} = chatViewSlice.actions
export default chatViewSlice.reducer