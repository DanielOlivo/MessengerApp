import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId, UserInfo } from "shared/src/Types";
import { login, LoginResponse } from "./thunks";
import { addInputHandler, addOutputHandler } from "../utils/socketActions";
import { ChatSliceState, handleInitLoading, initLoading } from "../ChatPage/slice";

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
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {

            })
            .addCase(login.rejected, (state) => {

            })
            .addCase(login.fulfilled, (state, action: PayloadAction<LoginResponse>) => {

            })
    }
})

export default slice.reducer
export const { requestUsers, handleUsers, search, handleSearch, disableSearch } = slice.actions

addOutputHandler(requestUsers, 'requestUsers')
addInputHandler('handleUsers', (users: UserInfoCollection, store) => store.dispatch(handleUsers(users)))

addOutputHandler(initLoading, 'initLoading')
addInputHandler('initLoadingRes', (state: ChatSliceState, store) => store.dispatch(handleInitLoading(state)))