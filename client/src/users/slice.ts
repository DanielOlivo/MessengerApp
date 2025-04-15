import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId, UserInfo } from "shared/src/Types";
import { addInputHandler, addOutputHandler } from "../utils/socketActions";
import { Commands } from "shared/src/MiddlewareCommands";

export type UserInfoCollection = { [P: UserId]: UserInfo }

export interface UserSliceState {
    users: UserInfoCollection
    online: UserId[]
    searchTerm: string
    onSearch: boolean
    searchResult: UserId[]
}

const initialState: UserSliceState = {
    users: {},
    online: [],
    searchTerm: '',
    onSearch: false,
    searchResult: [] 
}

const slice = createSlice({
    name: 'users',
    initialState,
    reducers: {

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        requestUsers: (state) => {},

        handleUsers: (state, action: PayloadAction<UserInfoCollection>) => {
            console.log('handling users')
            state.users = {
                ...state.users,
                ...action.payload
            }
        },

        search: (state, action: PayloadAction<string>) => {
            state.onSearch = true
            state.searchTerm = action.payload
        },

        handleSearch: (state, action: PayloadAction<UserInfoCollection>) => {
            state.users = {
                ...state.users,
                ...action.payload
            }
            state.searchResult = Object.keys(action.payload)
        },

        disableSearch: (state) => {
            state.onSearch = false
            state.searchResult = []
        } 
    },
})

export default slice.reducer
export const { requestUsers, handleUsers, search, handleSearch, disableSearch } = slice.actions

addOutputHandler(requestUsers, Commands.UsersRequest)
addInputHandler(Commands.UsersResponse, (users: UserInfoCollection, store) => store.dispatch(handleUsers(users)))

addOutputHandler(search, Commands.SearchReq)
addInputHandler(Commands.SearchRes, (users: UserInfoCollection, store) => store.dispatch(handleSearch(users)))