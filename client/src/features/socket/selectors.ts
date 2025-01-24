import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"
import { Group, DM } from "../../../../types/Types"


// list

export const selectUser = (state: RootState) => {
    return state.socket.user
}

export const selectUsers = (state: RootState) => state.socket.users
export const selectMemberships = (state: RootState) => state.socket.memberships
export const selectMembershipList = (state: RootState) => 
    Object.values(state.socket.memberships)

export const selectUserList = (state: RootState) => {
    const {users} = state.socket
    return Object.values(users)
}

export const selectMessageList = (state: RootState) => {
    return Object.values(state.socket.messages)
}

export const getSelectedChat = (state: RootState) => {
    return state.socket.selectedChat
}

export const selectChats = (state: RootState) => {
    return state.socket.chats
}

export const isGroupSelected = createSelector(
    getSelectedChat,
    selectChats,
    (chatId, chats): boolean => !!chatId && Object.keys(chats[chatId]).includes('name')
)

export const selectGroupMemberCount = createSelector(
    getSelectedChat,
    selectMembershipList,
    isGroupSelected,
    (chatId, memberships, isGroup) => {
        if(!isGroup){
            return 0
        }
        return memberships.filter(m => m.groupId === chatId).length
    }
)



export const selectChatName = createSelector(
    getSelectedChat,
    selectChats,
    isGroupSelected,
    selectUser,
    selectUsers,
    (chatId, chats, isGroup, user, users) => {
        if(!chatId){
            return undefined
        }
        else if(isGroup){
            return (chats[chatId] as Group).name
        }
        else {
            const dm = chats[chatId] as DM
            return dm.user1Id == user.id ? users[dm.user2Id].username : users[dm.user1Id].username
        }
    }
)


    

