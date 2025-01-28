import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { SendReq } from "../../../../types/Client";

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
        
        send: (state, action: PayloadAction<SendReq>) => {
            // nothing
        },

    }
})

export const {send} = senderSlice.actions
export default senderSlice.reducer