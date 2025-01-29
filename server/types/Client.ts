import { ChatId, UserId, DbUser } from "./Types"

// requests
export interface SendReq {
    chatId: string
    content: string
}

export interface ChatListReq {}

export interface SearchReq {
    criteria: string
}

export interface ChatSelect {
    chatId: string
}

export interface UserInfoReq {
    userId: UserId
}

export interface GroupInfoReq {
    chatId: ChatId
}

export interface NewGroupReq {
    name: string
    users: UserId[]
}

export interface GroupRemoveReq {
    chatId: ChatId
}


export interface Credentials {
    username: string
    password: string
}

export interface Typing {
    username: string 
    userId: string 
    chatId: string
}

export interface GroupReq {
    members: GroupMember[]
    name: string
    chatId?: string
}

// responses

export interface ChatListItem {
    chatName: string
    content: string
    username: string,
    chatId: string
    unreadCount?: number
}

export interface ContactItem {
    id: UserId
    username: string
}

export interface GroupMember extends ContactItem {
    isMember: boolean
}

export interface ChatSelectRes {
    chatId: string
    messages: ChatMessage[]
    headerInfo: HeaderInfo
}

export interface ChatMessage {
    userId: string
    chatId: string
    content: string,
    username: string,
    created: Date,
    isOwner: boolean,
    unread?: boolean
    messageId: string
}

export interface HeaderInfo {
    chatName: string 
    count: number
    // isDm: boolean
}

export interface SendRes {
    chatId: string,
    userId: string
    username: string
    content: string
    messageId: string
}

export type SearchRes = {username: string, id: string}[]

export interface Info {
    id: string
    name: string
}

export interface UserInfo extends Info {

}

export interface GroupInfo extends Info {
    isAdmin: boolean
}


export interface UserAuthData {
    id: string
    username: string
    token: string
}