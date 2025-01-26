import { RootState } from "../../app/store";

export const selectHeaderInfo = (state: RootState) => 
    state.header.info

export const selectTyping = (state: RootState) =>
    state.header.typing

export const selectOnlineStatus = (state: RootState) =>
    state.header.onlineStatus