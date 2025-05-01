import { createSelector } from "@reduxjs/toolkit";
import { RootState } from "../app/store";
import { selectAllUsers } from "../users/selectors";
import { ContactProps } from "./components/Contact/Contact";
import { selectUserId } from "../Auth/selectors";
import { EditChanges, EditState } from "./slice";

export const selectState = (state: RootState) => state.group.state
export const selectChatId = (state: RootState) => state.group.chatId
export const selectGroupMemberIds = (state: RootState) => state.group.inGroup
export const selectIsOnSearch = (state: RootState) => state.group.onSearch
export const selectSearchResultIds = (state: RootState) => state.group.searchResult
export const selectIsAdmin = (state: RootState) => state.group.isAdmin
export const selectName = (state: RootState) => state.group.name
const selectSearchResult = (state: RootState) => state.group.searchResult
const selectMembers = (state: RootState) => state.group.inGroup
export const selectIsGroup = (state: RootState) => state.group.isGroup


export const selectContactsOnSearch = createSelector(
    selectAllUsers,
    selectSearchResult,
    selectMembers,
    selectState,
    selectIsAdmin,
    (users, ids, members, state, isAdmin): ContactProps[] => {
        return ids.map(id => ({
            userId: id,
            name: users[id].name,
            iconSrc: users[id].iconSrc,
            editable: state === 'onCreate' || (state === 'onUpdate' && isAdmin),
            inGroup: members.includes(id)
        }))
    }
)

export const selectMemberProps = createSelector(
    selectContactsOnSearch,
    (contacts) => contacts.filter(contact => contact.inGroup)
)

export const selectNonMemberProps = createSelector(
    selectContactsOnSearch,
    (contacts) => contacts.filter(contact => !contact.inGroup)
)


export const selectContactsInGroup = createSelector(
    selectGroupMemberIds,
    // selectFiltered,
    selectAllUsers,
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
    // selectFiltered,
    selectAllUsers,
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


const selectChat = (state: RootState) => state.chat
export const selectEditButtonArg = createSelector(
    selectChat,
    selectUserId,
    (chat, userId): EditState => {
        const {chatInfo } = chat
        const chatId = chat.displayedChatId
        const isGroup = chatId in chatInfo ? chatInfo[chatId].isGroup : false   
        const isAdmin = chatId in chat.admins ? chat.admins[chatId].includes(userId) : false        
        const members = chat.members[chatId]
        const admins = chat.admins[chatId]

        return {
            chatId,
            name: chatId in chatInfo ? chat.chatInfo[chatId].name : 'ERROR WITH CHAT INFO',
            isGroup,
            isAdmin,
            members, 
            admins 
        }
    }
)

const selectSlice = (state: RootState) => state.group
export const selectCurrentState = createSelector(
    selectSlice,
    (state): EditChanges => {
        return {
            chatId: state.chatId,
            name: state.name,
            members: state.inGroup,
            admins: state.admins
        }
    }
)