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

// responses

export interface ChatListItem {
    chatName: string
    content: string
    username: string,
    chatId: string
    unreadCount: number
}

export interface ChatMessage {
    content: string,
    username: string,
    created: Date,
    isOwner: boolean,
    unread: boolean
}

export interface HeaderInfo {
    chatName: string 
    count: number
    isDm: boolean
}

export interface SendRes {
    chat: string,
    userId: string
    username: string
    content: string
}

export interface SearchRes {

}

export interface Info {
    id: string
    name: string
}

export interface UserInfo extends Info {

}

export interface GroupInfo extends Info {
    isAdmin: boolean
}
