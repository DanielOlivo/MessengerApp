import dayjs from 'dayjs'
import { createSelector } from '@reduxjs/toolkit'
import { RootState } from '../app/store'
import { ChatItemProps } from './components/ChatList/components/ChatItem'
import { TextMessageProps } from './components/ChatView/components/TextMessage/TextMessage'
import { selectUserId } from '../features/auth/selectors'

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

export const isChatSelected = (state: RootState) => state.chat.displayedChatId !== ''

export const selectSlice = (state: RootState) => state.chat


// ------------------ chatlist ----------------------
export const selectChatItems = createSelector(
    selectSlice,
    (chat): ChatItemProps[] => {
        const { chatMessageIds, chatInfo, messages, pinned, displayedChatId } = chat
        const items = Object.entries(chatMessageIds).filter(([, msgIds]) => msgIds.length > 0).map(([chatId, [msgId,]]) => {
            const info = chatInfo[chatId]
            const msg = messages[msgId]
            const isPinned = pinned.includes(chatId)

            const result = {
                chatId,
                title: info.name,
                content: msg.content,
                iconSrc: info.iconSrc,
                unseenCount: 0,
                selected: chatId === displayedChatId,
                pinned: isPinned,
                timestamp: msg.timestamp
            }
            return result
        }).sort((item1, item2) => item1.timestamp > item2.timestamp ? 1 : -1).map(item => ({
            ...item,
            timestamp: dayjs(item.timestamp).format('hh:mm')
        }))
        return items
    }
)

export const selectPinnedItems = createSelector(
    selectChatItems,
    (items) => items.filter(item => item.pinned)
)

export const selectUnpinnedItems = createSelector(
    selectChatItems,
    (items) => items.filter(item => !item.pinned)
)


// ------------------ header ----------------------
export const selectHeaderTitle = (state: RootState) => state.chat.chatInfo[state.chat.displayedChatId].name
export const selectHeaderIcon = (state: RootState) => state.chat.chatInfo[state.chat.displayedChatId].iconSrc
export const selectHeaderStatus = (state: RootState) => state.chat.chatInfo[state.chat.displayedChatId].status


// ------------------ message container ----------------------
export const selectChatMessages = createSelector(
    selectChatMessageIds,
    selectAllMessages,
    selectUserId,
    (ids, msgs, userId): TextMessageProps[] => ids.map(id => {
        const {messageId, content, chatId, timestamp, sender} = msgs[id]
        return {
            chatId,
            text: content,
            id: messageId,
            timestamp: dayjs(timestamp).format('hh:mm'),
            status: 'seen',
            isOwn: sender === userId
        }
    })
)


// ------------------ typing ----------------------

// todo: use createSelector
export const selectTypingForContainer = (state: RootState) => {
    const { displayedChatId, typing, users: info } = state.chat
    const users = Object.entries(typing[displayedChatId])
    return users.filter(([, timestamp]) => 
        dayjs().valueOf() - timestamp < 2000).map(([userId,]) => 
            info[userId])
}