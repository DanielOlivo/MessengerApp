import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId, UserInfo } from "shared/src/Types";

export interface UserSliceState {
    users: {[P: UserId] : UserInfo}
    searchTerm: string
}

const initialState: UserSliceState = {
    users: {},
    searchTerm: '',
}

const slice = createSlice({
    name: 'users',
    initialState,
    reducers: {

        addUser: (state, action: PayloadAction<UserInfo>) => {
            const { id } = action.payload
            state.users[id] = action.payload
        },

        updateUser: (state, action: PayloadAction<UserInfo>) => {
            const { id } = action.payload
            state.users[id] = action.payload
        },

        search: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload
        }
    }
})

export default slice.reducer
export const { addUser, updateUser, search } = slice.actions