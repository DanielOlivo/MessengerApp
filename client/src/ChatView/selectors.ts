import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { Typing } from "@shared/Types";

export const selectChatId = (state: RootState) => state.chatView2.chatId
export const selectAllItems = (state: RootState) => state.chatView2.items

export const selectItems = createSelector(
    selectAllItems,
    selectChatId,
    (items, id) => id in items ? items[id] : []
)

export const selectHeader = (state: RootState) => state.chatView2.header

const defaultTyping: Typing = {
    username: '',
    chatId: '',
    userId: '',
    timestamp: 0 
}

export const selectTyping = (state: RootState) => state.chatView2.typing
