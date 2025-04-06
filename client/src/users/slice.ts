import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserId, UserInfo } from "shared/src/Types";

export type UserInfoCollection = { [P: UserId]: UserInfo }

export interface UserSliceState {
    users: UserInfoCollection
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

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        requestUsers: (state) => {},

        handleUsers: (state, action: PayloadAction<UserInfoCollection>) => {
            state.users = {
                ...state.users,
                ...action.payload
            }
        },

        search: (state, action: PayloadAction<string>) => {
            state.searchTerm = action.payload
        }
    }
})

export default slice.reducer
export const { requestUsers, handleUsers, search } = slice.actions