import { RootState } from "../app/store";

export const selectGroupId = (state: RootState) => state.group.groupId
export const selectGroupMemberIds = (state: RootState) => state.group.inGroup
export const isOnSearch = (state: RootState) => state.group.onSearch

