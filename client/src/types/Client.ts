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

export type UserId = string
export type ChatId = string
export type DmId = string
export type GroupId = string
export type MembershipId = string
export type MessageId = string
export type GroupRole = 'user' | 'admin'

export interface DbUser {

    id: UserId
    username: string
    hashed: string
    created: Date
    bio?: string

}

export interface Chat {
    id: ChatId 
    isDm: boolean
}

export interface DM {

    id: ChatId
    user1Id: UserId
    user2Id: UserId
    created: Date

}

export interface Group {

    id: GroupId
    name?: string
    created: Date
}

export interface Membership {

    id: MembershipId 
    userId: UserId
    groupId: GroupId
    created: Date
    isAdmin: boolean
}

export interface Message {

    id: MessageId
    userId: UserId
    chatId: ChatId
    content: string
    created: Date

}

export interface Credentials {
    username: string
    password: string
    
}

export interface RegCredentials extends Credentials {
    bio?: string
}

export interface TokenPayload {
    id: string 
    username: string
}

export interface SearchResult {
    users: Partial<DbUser>[],
    groups: Group[]
}

export interface Chats {
    dms: DM[]
    groups: Group[]
}

export interface DMPostReq {
    userId: UserId
    content: string
}

export interface DMPosted {
    dm: DM
    message: Message
}

export interface MessageReadReq {
    message: Message
}

export interface MessageReadRes {
    userId: UserId,
    message: Message
}

// export interface Unread {
//     userId: UserId 
//     messageId: MessageId
// }

// export interface Message
