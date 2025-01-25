import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "../../app/store"
import { Group, DM, ChatId, Message } from "../../../../types/Types"
import dateGroupFn from "../../utils/dateGroupFn"
import maxBy from "../../utils/maxBy"
import { ChatItemProp } from "../../components/ChatItem"
import { ServiceMessage } from "./socketSlice"
import { DateMessageProp } from "../../components/DateMessage"
import { UserMessageProp } from "../../components/UserMessage"

export const selectConnectionStatus = (state: RootState) => 
    state.socket.isConnected

export const selectStatus = (state: RootState) =>
    state.socket.isConnected

export const selectUser = (state: RootState) => 
    state.socket.user

export const selectUsers = (state: RootState) => 
    state.socket.users

export const selectMemberships = (state: RootState) => 
    state.socket.memberships

export const selectMembershipList = (state: RootState) => 
    Object.values(state.socket.memberships)

export const selectOnline = (state: RootState) =>
    state.socket.online

export const selectTyping = (state: RootState) => 
    state.socket.typing

export const selectUserList = (state: RootState) => {
    const {users} = state.socket
    return Object.values(users)
}

export const selectOverlayed = (state: RootState) => 
    state.socket.overlayed

export const selectMessageList = (state: RootState) => 
    Object.values(state.socket.messages)

export const getSelectedChat = (state: RootState) => 
    state.socket.selectedChat

export const selectDMs = (state: RootState) => 
    state.socket.dms

export const selectGroups = (state: RootState) => 
    state.socket.groups

export const selectChatTypes = createSelector( // chatId: isDm
    selectDMs,
    selectGroups,
    (dms, groups) => {
        const dmEntries = Object.keys(dms).map(id => [id, true])
        const groupEntries = Object.keys(groups).map(id => [id, false])
        const result: {[chatId: ChatId]: boolean} = Object.fromEntries(dmEntries.concat(groupEntries))
        return result
    }
)

export const selectLastMessages = createSelector(
    selectMessageList,
    (messages) => {
        const grouped = Object.groupBy(messages, msg => msg.chatId)
        const keepLast: {chatId: ChatId, message: Message}[] = Object.entries(grouped).map(([chatId, msgs]) => {
            return {
                chatId: chatId,
                message: maxBy(msgs!, msg => msg.created.getMilliseconds())
            }
        })
        return keepLast.sort(({message}) => message.created.getMilliseconds())
    }
)

export const selectGroupedMessagesByChatId = createSelector(
    selectMessageList,
    (messages) => Object.groupBy(messages, msg => msg.chatId)
)

export const selectChatList = createSelector(
    selectUser,
    selectUsers,
    selectGroups,
    selectDMs,
    selectChatTypes,
    selectLastMessages,
    (user, users, groups, dms, chatTypes, last) => {
        return last.map(({chatId, message}) => {
            const content = message.content
            const lastUser = users[message.userId]
            let name: string 
            if(!chatTypes[chatId]){
                name = groups[chatId].name || 'group'
            }
            else {
                const dm = dms[chatId]
                name = dm.user1Id == user.id ? users[dm.user2Id].username : users[dm.user1Id].username
            }
            const result: ChatItemProp = {
                chatId,
                content,
                lastSenderName: lastUser.username,
                name
            }
            return result 
        })
    }
)

export const isGroupSelected = createSelector(
    getSelectedChat,
    selectGroups,
    (chatId, groups): boolean => !!chatId && Object.keys(groups).includes(chatId)
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
    selectDMs,
    selectGroups,
    isGroupSelected,
    selectUser,
    selectUsers,
    (chatId, dms, groups, isGroup, user, users) => {
        if(!chatId){
            return undefined
        }
        else if(isGroup){
            return groups[chatId].name
        }
        else {
            const dm = dms[chatId]
            return dm.user1Id == user.id ? users[dm.user2Id].username : users[dm.user1Id].username
        }
    }
)


export const selectOthersIdWhenDm = createSelector(
    getSelectedChat,
    selectDMs,
    isGroupSelected,
    selectUser,
    (chatId, dms, isGroup, user) => {
        if(!chatId || isGroup){
            return undefined
        }
        const dm = dms[chatId]
        return dm.user1Id == user.id ? dm.user2Id : dm.user1Id
    }
)    

export const selectOthersOnlineStatusWhenDm = createSelector(
    selectOthersIdWhenDm,
    selectOnline,
    (otherId, online) => !!otherId && online.includes(otherId)
)

export type MessageItem = ServiceMessage | DateMessageProp | UserMessageProp

export const selectMessages = createSelector(
    getSelectedChat,
    selectGroupedMessagesByChatId,
    selectUser,
    selectUsers,
    (chatId, messages, user, users) => {
        let result: MessageItem[]

        if(!chatId){
            result = []
            return result
        }

        const first: MessageItem = {msg: 'chat started'} as ServiceMessage

        const msgs = messages[chatId!]!
        const dateGrouped = Object.groupBy(msgs, dateGroupFn)
        const sorted = Object.entries(dateGrouped).sort(([dt, _]) => new Date(dt).getMilliseconds())
        result = sorted.map(([dt, msgs]) => {
            const dateMsg: DateMessageProp = {date: new Date(dt)}
            const userMsgs: UserMessageProp[] = msgs!.map(msg => {
                return {
                    sender: users[msg.userId].username,
                    message: msg.content,
                    isOwner: user.id == msg.userId,
                    isRead: false
                }
            })
            return [dateMsg, ...userMsgs] as MessageItem[]
        }).reduce((acc, items) => acc.concat(items), [first])
        return result
    }
)


// trash


// export const selectChatName = (state: RootState) => {
//     const {user, users, chats, selectedChat} = state.socket

//     if(!selectedChat){
//         return ''
//     }

//     const getChatName = (chatId: ChatId) => {
//         const _chat = chats[chatId]

//         if(Object.keys(_chat).includes('name')) {
//             const group: Group = _chat
//             return group.name || 'unnamed group';
//         }

//         if(Object.keys(_chat).includes('user1Id')){
//             const dm: DM = _chat as DM
//             const otherUserId = user.id == dm.user1Id ? dm.user2Id : dm.user1Id
//             const usr = users[otherUserId]
//             return usr.username
//         }
//     }

//     return getChatName(selectedChat!)
// }

// export const getGroupMembersAmount = (state: RootState) => {
//     const {selectedChat, memberships} = state.socket

//     if(!selectedChat){
//         return selectedChat
//     }

//     return Object.values(memberships).filter(member => member.groupId === selectedChat).length
// }

// export const selectChatList = (state: RootState) => {
//     const {user, users, messages, chats} = state.socket

//     const msgs: Message[] = Object.values(messages)
//     const groups = Object.groupBy(msgs, (msg) => msg.chatId)
//     const limited = Object.fromEntries(
//         Object.entries(groups).map(([chatId, msgs]) => [chatId, msgs?.sort(msg => -msg.created)[0]!])
//     )
//     const withUser = Object.fromEntries(
//         Object.entries(limited).map(([chatId, msg]) => [chatId, {msg, user: users[msg!.userId]}])
//     )

//     const getChatName = (chatId: ChatId) => {
//         const _chat = chats[chatId]

//         if('name' in _chat) {
//             const group: Group = _chat
//             return group.name || 'unnamed group';
//         }

//         if('user1Id' in _chat){
//             const dm: DM = _chat
//             const otherUserId = user.id == dm.user1Id ? dm.user2Id : dm.user1Id
//             const usr = users[otherUserId]
//             return usr.username
//         }
//     }

//     const withNames = Object.entries(withUser).map(([chatId, {msg, user}]) => {
//         return {chatId, msg, user, name: getChatName(chatId)}}).sort(({msg}) => -msg.created)

//     return withNames
// }

// export const selectMessages = (state: RootState) => {
//     const {user, users, messages, chats, selectedChat} = state.socket

//     if(!selectedChat){
//         return []
//     }

//     const msgs = Object.values(messages).filter(msg => msg.chatId === selectedChat)

//     function getGroupKey({created}: Message): string {
//         return created.toLocaleDateString('en-us', {
//             year: 'numeric',
//             month: '2-digit',
//             day: 'numeric'
//         })
//     }

//     const grouped = Object.groupBy(msgs, msg => getGroupKey(msg))

//     const first: (ServiceMessage | DateMessageProp | UserMessageProp)[] = [{msg: 'chat started'}]

//     const result: (UserMessageProp | DateMessageProp | ServiceMessage)[] = Object.entries(grouped).reduce((acc, v) => {
//         const msgs2 = v[1]?.map(msg => {
//             return {
//                 isOwner: msg.userId === user.id,
//                 message: msg.content,
//                 isRead: true // later
//             }
//         }) as (ServiceMessage | DateMessageProp | UserMessageProp)[]
//         const dateMsg: DateMessageProp = {date: new Date(Date.parse(v[0]))}
//         return acc.concat([dateMsg]).concat(msgs2)
//     }, first)

//     return result
// }