import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export type ContextType = 'idle' | 'chatItem'

export interface Position {
    x: number
    y: number
}

export interface ContextState {
    type: ContextType
    id: string
    position: Position
}


const initialState: ContextState = {
    type: 'idle',
    id: '',
    position: {x: 0, y: 0}
}



const slice = createSlice({
    name: 'context',
    initialState,
    reducers: {

        setVisible: (state, action: PayloadAction<ContextState>) => {
            return action.payload
        },

        disable: (state) => {
            state.id = ''
            state.type = 'idle'
        }
    }
})

export default slice.reducer
export const { setVisible, disable } = slice.actions