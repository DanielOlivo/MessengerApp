import { RootState } from "../../app/store";

export const selectHeaderInfo = (state: RootState) => 
    state.header.headerInfo

export const selectTyping = (state: RootState) =>
    state.header.typing

export const selectTypingTrigger = (state: RootState) => 
    state.header.typingTrigger

export const selectOnlineStatus = (state: RootState) =>
    state.header.onlineStatus