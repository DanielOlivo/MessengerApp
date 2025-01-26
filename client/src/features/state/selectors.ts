import { RootState } from "../../app/store";

export const selectGlobalState = (state: RootState) => 
    state.state.state

export const selectActiveChat = (state: RootState) =>
    state.state.activeChatId