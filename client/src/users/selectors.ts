import { UserId, UserInfo } from "shared/src/Types";
import { RootState } from "../app/store";
import { createSelector } from "@reduxjs/toolkit";

export const selectUserInfo = (userId: UserId) => (state: RootState) => state.users.users[userId]

export const selectAllUsers = (state: RootState) => state.users.users
export const selectSearchTerm = (state: RootState) => state.users.searchTerm
export const selectIsOnSearch = (state: RootState): boolean => state.users.onSearch

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

export const selectSearchResult = (state: RootState): UserId[] => state.users.searchResult

export const selectSearchResultItems = createSelector(
    selectIsOnSearch,
    selectAllUsers,
    selectSearchResult,
    (onSearch, users, ids): UserInfo[] => !onSearch ? [] : ids.map(id => users[id])
)