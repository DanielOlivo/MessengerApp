import { UserId, UserInfo } from "shared/src/Types";
import { RootState } from "../app/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectUserInfo = (userId: UserId) => (state: RootState) => state.users.users[userId]

export const selectAllUsers = (state: RootState) => state.users.users
export const selectSearchTerm = (state: RootState) => state.users.searchTerm

export const selectFiltered = createSelector(
    selectAllUsers,
    selectSearchTerm,
    (users, term): { [P: UserId]: UserInfo} => {
        if(term.length < 2){ // return all
            return users
        }
        return Object.fromEntries(Object.values(users).filter(info => 
            info.name.includes(term)).map(info => 
                [info.id, info])
        )
    }
)

export const selectSearchResult = createSelector(
    selectAllUsers,
    selectSearchTerm,
    (users, term): UserInfo[] => Object.values(users).filter(user => user.name.includes(term))
)