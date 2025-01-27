import { RootState } from "../../app/store";

export const selectListState = (state: RootState) => state.chatList.state

export const selectChatList = (state: RootState) => state.chatList.list

export const selectSearchResult = (state: RootState) => state.chatList.searchResult