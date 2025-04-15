import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId, ChatId, } from "shared/src/Types";
import { handleUsers, UserInfoCollection } from "../users/slice";
import { addInputHandler, addOutputHandler } from "../utils/socketActions";
import { GroupCreateReq, GroupCreateRes } from '@shared/ChatControl'

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

export interface EditState {
    chatId: ChatId
    isGroup: boolean
    isAdmin: boolean 
    name: string
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

        setEdit: (state, action: PayloadAction<EditState>) => {
            // const { chatId, isAdmin, name, isGroup } = action.payload
            // return { ...state, name, isAdmin, isGroup, chatId}
            return { ...state, ...action.payload }
        },

        setState: (state, action: PayloadAction<State>) => {
            state.state = action.payload
        },

        setName: (state, action: PayloadAction<string>) => {
            state.name = action.payload
        },

        addToGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup.push(action.payload)
            return
        },

        removeFromGroup: (state, action: PayloadAction<UserId>) => {
            state.inGroup = state.inGroup.filter(id => id !== action.payload)
        },

        createGroup: (state, action: PayloadAction<GroupCreateReq>) => {
            state.state = 'idle'
            state.inGroup = [] 
            state.onSearch = false
            state.searchResult = []
            state.name = ''
        },

        applyChanges: (state) => {
            // todo
        },


        deleteGroup: (state, action: PayloadAction<GroupDelete>) => {
            // todo
        },

        handleGroupDelete: (state, action: PayloadAction<GroupDelete>) => {
            // todo
            if(state.state !== 'idle'){
                state.state = 'idle'
            }
        },

        leaveGroup: (state, action: PayloadAction<GroupLeaving>) => {
            // todo
        },
        handleGroupLeave: (state, action: PayloadAction<GroupLeaving>) => {
            // todo

            state.state = 'idle'
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
    setIdle, setCreate, setEdit,
    setState,
    setName,
    addToGroup, removeFromGroup, 
    leaveGroup, handleGroupLeave,
    createGroup,
    deleteGroup,
    searchContacts: searchContact, setSearchStatus, handleSearchContact
} = slice.actions

addInputHandler('handleContactsSearch', (users: UserInfoCollection, store) => {
    store.dispatch(handleUsers(users))
    store.dispatch(handleSearchContact(Object.keys(users)))
})
addOutputHandler(searchContact, 'searchContacts')


export interface GroupLeaving {
    chatId: ChatId
    userId: UserId
    actor: UserId
}

export interface GroupDelete {
    chatId: ChatId
    actor: UserId
}

addInputHandler('handleLeave', (arg: GroupLeaving, store) => {
    store.dispatch(handleGroupLeave(arg))
})
addOutputHandler(leaveGroup, 'leave')


addOutputHandler(createGroup, 'createGroup')
// addInputHandler('handleGroupCreate', (res: GroupCreateRes, store) => store.dispatch(handleGroupCreate(res)))