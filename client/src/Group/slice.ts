import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId } from "shared/src/Types";

export type State = 'idle' | 'onCreate' | 'onUpdate'

export interface Contact {
    userId: string
    username: string
    iconSrc: string
}

export interface GroupSliceState {
    state: State
    groupId: string
    isAdmin: boolean

    inGroup: UserId[]

    onSearch: boolean
    searchResult: Contact[]
}

const initialState: GroupSliceState = {
    state: 'idle',
    groupId: '',
    isAdmin: false,

    inGroup: [],

    onSearch: false,
    searchResult: [] 
}

const slice = createSlice({
    name: 'group',
    initialState,
    reducers: {
        setState: (state, action: PayloadAction<State>) => {
            state.state = action.payload
        },

        addToGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup.push(action.payload)
        },

        removeFromGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup = state.inGroup.filter(id => id !== action.payload)
        }

    }
})

export default slice.reducer
export const {  
    setState,
    addToGroup, removeFromGroup
} = slice.actions
