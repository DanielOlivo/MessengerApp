import dayjs from 'dayjs'
import { ChatId, MessageId } from 'shared/src/Types'
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../app/store'
import { ChatItemProps } from './components/ChatList/components/ChatItem'

export const selectCurrentChatId = (state: RootState ) => 
    state.chat.displayedChatId

export const selectAllMessages = (state: RootState) =>
    state.chat.messages

export const selectChatMessageIds = (state: RootState) => {
    const { displayedChatId, chatMessageIds } = state.chat
    if(displayedChatId === ''){
        return []
    }
    return chatMessageIds[displayedChatId]
}

export const selectChatInfo = (state: RootState) => state.chat.chatInfo


// ------------------ chatlist ----------------------
export const selectChatItems = createSelector(
    selectChatMessageIds,
    selectChatInfo,
    selectAllMessages,
    (msgIds, info, msgs) => {
        const chatAndLastMessageIds: [ChatId, MessageId][] = Object.entries(msgIds).map(([chatId, msgs]) => [chatId, msgs[0]])
        const props: ChatItemProps[] = chatAndLastMessageIds.map(([chatId, messageId]) => ({
            chatId,
            content: msgs[messageId].content,
            timestamp: msgs[messageId].created,
            iconSrc: info[chatId].iconSrc,
            unseenCount: 0,
            selected: false,
            title: info[chatId].name,
            pinned: false
        })).sort(prop => prop.timestamp)
        return props
    }
)


// ------------------ header ----------------------
export const selectHeaderInfo = (state: RootState) => {
    const { displayedChatId, chatInfo } = state.chat
    if(!(displayedChatId in chatInfo)){
        return {
            name: '',
            iconSrc: '',
            status: ''
        }
    }
    return chatInfo[displayedChatId]
}


// ------------------ message container ----------------------
export const selectChatMessages = createSelector(
    selectChatMessageIds,
    selectAllMessages,
    (ids, msgs) => ids.map(id => msgs[id])
)


// ------------------ typing ----------------------
export const selectTypingForContainer = (state: RootState) => {
    const { displayedChatId, typing, users: info } = state.chat
    const users = Object.values(typing)
    const ids = Object.keys(users)
    return ids.filter(id => dayjs().subtract(users[id]).valueOf() < 2000).map(id => info[id])
}