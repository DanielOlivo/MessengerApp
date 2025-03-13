import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";

export const selectChatId = (state: RootState) => state.chatView2.chatId
export const selectAllItems = (state: RootState) => state.chatView2.items

export const selectItems = createSelector(
    selectAllItems,
    selectChatId,
    (items, id) => id in items ? items[id] : []
)

export const selectHeader = (state: RootState) => state.chatView2.header

export const selectAllTypings = (state: RootState) => state.chatView2.typing

export const selectTyping = createSelector(
    selectAllTypings,
    selectChatId,
    (items, id) => id in items ? items[id] : []
)
