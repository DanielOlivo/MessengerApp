import { UserId } from "shared/src/Types";
import { RootState } from "../app/store";

export const selectUserInfo = (userId: UserId) => (state: RootState) => state.users.users[userId]

export const selectAllUsers = (state: RootState) => state.users