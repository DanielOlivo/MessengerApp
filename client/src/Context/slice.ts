import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatId } from "shared/src/Types";

export type ContextType = 'idle' | 'chatItem'

export interface ContextState {
    type: ContextType
}

const initialState: ContextState = {
    type: 'idle'
}

const slice = createSlice({
    name: 'context',
    initialState,
    reducers: {


    }
})

export default slice.reducer