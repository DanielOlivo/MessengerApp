import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SendReq, Typing } from "../../../../types/Client";

export interface SenderState {
    isActive: boolean
}

const initialState: SenderState = {
    isActive: false
}

export const senderSlice = createSlice({
    name: 'sender',
    initialState,
    reducers: {
        
        send: (state, action: PayloadAction<SendReq>) => {},

        sendTyping: (state, action: PayloadAction<Typing>) => {},

    }
})

export const {send, sendTyping} = senderSlice.actions
export default senderSlice.reducer