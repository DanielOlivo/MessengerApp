import { RootState } from "../../app/store";

export const selectIsOn = (state: RootState) =>
    state.group.isOn

export const selectGroupMembers = (state: RootState) => 
    state.group.members

export const selectGroupId = (state: RootState) => 
    state.group.chatId