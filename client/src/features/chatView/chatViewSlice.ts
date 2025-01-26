import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage } from "../../../../controllers/socket";
import { ChatId } from "../../../../types/Types";

export interface ChatViewState {
    messages: ChatMessage[]
}

const initialState: ChatViewState = {
    messages: []
}

export const chatViewSlice = createSlice({
    name: 'chatView',
    initialState,
    reducers: {
        
        reqMsgs: (state, action: PayloadAction<ChatId>) => {},

        setMsgs: (state, action: PayloadAction<ChatMessage[]>) => {
            state.messages = action.payload
        }

    }
})

export const {reqMsgs, setMsgs} = chatViewSlice.actions
export default chatViewSlice.reducer