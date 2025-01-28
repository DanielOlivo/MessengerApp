import { RootState } from "../../app/store";

export const selectAuthStatus = (state: RootState) => state.auth.authenticated

export const tokenExists = (state: RootState) => 
    state.auth.data?.token !== undefined

export const selectToken = (state: RootState) => state.auth.data?.token

export const selectUserId = (state: RootState) => 
    state.auth.data?.id

export const selectUsername = (state: RootState) => 
    state.auth.data?.username