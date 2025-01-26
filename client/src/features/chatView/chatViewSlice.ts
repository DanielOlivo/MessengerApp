import { createSlice } from "@reduxjs/toolkit";
import { ChatMessage } from "../../../../controllers/socket";

export interface ChatViewState {
    messages: ChatMessage[]
}

const initialState: ChatViewState = {
    messages: []
}

export const chatViewSlice = createSlice({
    name: 'chatView',
    initialState,
    reducers: {}
})

// export const 
export default chatViewSlice.reducer