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


// responses

export interface ChatListItem {
    chatName: string
    content: string
    username: string,
    chatId: string
    unreadCount?: number
}

export interface ContactItem {
    userId: UserId
    username: string
}

export interface ChatSelectRes {

}

export interface ChatMessage {
    chatId: string
    content: string,
    username: string,
    created: Date,
    isOwner: boolean,
    unread?: boolean
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
