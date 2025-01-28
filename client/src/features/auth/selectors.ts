import { RootState } from "../../app/store";

export const selectAuthStatus = (state: RootState) => state.auth.authenticated


export const tokenExists = (state: RootState) => 
    state.auth.data?.token !== undefined
export const selectToken = (state: RootState) => state.auth.data?.token