import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId, CreateGroupReq } from "shared/src/Types";

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
    searchResult: UserId[]
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
        setIdle: (state) => {
            state.state = 'idle'
            state.groupId = ''
            state.isAdmin = false
            state.inGroup = []
            state.onSearch = false
            state.searchResult = []
        },

        setState: (state, action: PayloadAction<State>) => {
            state.state = action.payload
        },

        addToGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup.push(action.payload)
        },

        removeFromGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup = state.inGroup.filter(id => id !== action.payload)
        },

        createGroup: (state, action: PayloadAction<CreateGroupReq>) => {},

        setSearchStatus: (state, action: PayloadAction<boolean>) => {
            state.onSearch = action.payload
        },
        searchContacts: (state, action: PayloadAction<string>) => {
            // state.searchResult = 
        },
        handleSearchContact: (state, action: PayloadAction<UserId[]>) => {
            state.searchResult = action.payload
        }
    }
})

export default slice.reducer
export const {  
    setIdle,
    setState,
    addToGroup, removeFromGroup,
    createGroup,
    searchContacts: searchContact, setSearchStatus, handleSearchContact
} = slice.actions
