import { RootState } from "../../app/store";

export const onlyMessages = (state: RootState) => 
    state.chatView.messages

export const selectHeaderInfo = (state: RootState) => 
    state.chatView.header


export const selectChatId = (state: RootState) => 
    state.chatView.chatId