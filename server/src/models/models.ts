import { UserId, ChatId, MessageId } from "shared/src/Types"

export interface User {
    id: UserId
    username: string
    hash: string
    iconSrc: string
    created: Date
}

export interface Chat {
    id: ChatId
    isGroup: boolean
    created: Date
}

export interface ChatInfo {
    id: string
    chatId: ChatId
    name: string
    iconSrc: string
}

export interface ChatPin {
    id: string
    userId: UserId
    chatId: ChatId
    pinned: boolean
}

export interface Membership {
    id: string 
    chatId: ChatId
    userId: UserId
    isAdmin: boolean
    created: Date
}

export interface Message {
    id: MessageId
    chatId: ChatId
    userId: UserId
    content: string
    timestamp: Date
}