import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { selectFiltered } from "../users/selectors";
import { UserId, UserInfo } from "shared/src/Types";
import { ContactProps } from "./components/Contact";

export const selectState = (state: RootState) => state.group.state
export const selectGroupId = (state: RootState) => state.group.groupId
export const selectGroupMemberIds = (state: RootState) => state.group.inGroup
export const selectIsOnSearch = (state: RootState) => state.group.onSearch
export const selectSearchResultIds = (state: RootState) => state.group.searchResult
export const selectIsAdmin = (state: RootState) => state.group.isAdmin

export const selectContactsInGroup = createSelector(
    selectGroupMemberIds,
    selectFiltered,
    selectState,
    selectIsAdmin,
    (members, users, state, isAdmin): ContactProps[] => {
        const editable = state === 'onCreate' || state === 'onUpdate' && isAdmin
        return members.map(id => {
            const user = users[id]
            return {
                ...user,
                userId: user.id,
                editable,
                inGroup: true
            }
        })
    } 
)

export const selectContactsNotInGroup = createSelector(
    selectGroupMemberIds,
    selectFiltered,
    selectState,
    selectIsAdmin,
    (members, users, state, isAdmin): ContactProps[] => {
        const editable = state === 'onCreate' || state === 'onUpdate' && isAdmin
        return Object.values(users).filter(user => !members.includes(user.id)).map(user => ({
            ...user,
            userId: user.id,
            editable,
            inGroup: false
        }))
    } 
)

export const selectGroupName = createSelector(
    selectGroupId,
    (id): string => {
        return 'to be done'
    }
)

// export const selectSearchResultInGroupProps = createSelector(
//     selectGroupMemberIds,
//     selectSearchResult,
//     (ids, infos): ContactProps[] => infos.filter(info => ids.includes(info.id)).map(info => ({
//         ...info,
//         userId: info.id,
//         editable: true,
//         inGroup: true        
//     }))
// )

