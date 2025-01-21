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
