import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId, ChatId, CreateGroupReq } from "shared/src/Types";
import { handleUsers, UserInfoCollection } from "../users/slice";
import { addInputHandler, addOutputHandler } from "../utils/socketActions";

export type State = 'idle' | 'onCreate' | 'onUpdate'

export interface Contact {
    userId: string
    username: string
    iconSrc: string
}

export interface GroupSliceState {
    state: State
    isGroup: boolean
    chatId: string
    isAdmin: boolean

    name: string
    inGroup: UserId[]

    onSearch: boolean
    searchResult: UserId[]
}

const initialState: GroupSliceState = {
    state: 'idle',
    isGroup: true,
    chatId: '',
    isAdmin: false,

    name: '',
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
            state.chatId = ''
            state.isAdmin = false
            state.inGroup = []
            state.onSearch = false
            state.searchResult = []
        },

        setCreate: (state) => {
            state.state = 'onCreate'
        },

        setState: (state, action: PayloadAction<State>) => {
            state.state = action.payload
        },

        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload
        },

        addToGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup.push(action.payload)
        },

        removeFromGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup = state.inGroup.filter(id => id !== action.payload)
        },

        createGroup: (state, action: PayloadAction<CreateGroupReq>) => {},

        applyChanges: (state) => {
            // todo
        },

        removeGroup: (state, action: PayloadAction<ChatId>) => {
            // todo
        },

        leaveGroup: (state, action: PayloadAction<ChatId>) => {
            // todo
        },

        setSearchStatus: (state, action: PayloadAction<boolean>) => {
            state.onSearch = action.payload
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        searchContacts: (state, action: PayloadAction<string>) => {
            state.onSearch = true
        },
        handleSearchContact: (state, action: PayloadAction<UserId[]>) => {
            state.searchResult = action.payload 
        }
    }
})

export default slice.reducer
export const {  
    setIdle, setCreate,
    setState,
    setName,
    addToGroup, removeFromGroup, leaveGroup,
    createGroup, removeGroup,
    searchContacts: searchContact, setSearchStatus, handleSearchContact
} = slice.actions

addInputHandler('handleContactsSearch', (users: UserInfoCollection, store) => {
    store.dispatch(handleUsers(users))
    store.dispatch(handleSearchContact(Object.keys(users)))
})
addOutputHandler(searchContact, 'searchContacts')

