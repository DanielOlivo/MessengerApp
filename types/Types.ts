export type UserId = string
export type ChatId = string
export type DmId = string
export type GroupId = string
export type MembershipId = string

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

}

export interface Message {

    id: string
    userId: UserId
    chatId: DmId | GroupId
    content: string
    created: Date

}

