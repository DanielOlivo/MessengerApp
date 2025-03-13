import { RootState } from "../app/store";

export const selectItems = (state: RootState) => state.chatList2.items

export const selectPinned = (state: RootState) => 
    state.chatList2.items.filter(item => item.pinned)
export const selectUnpinned = (state: RootState) => 
    state.chatList2.items.filter(item => !item.pinned)