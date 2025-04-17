import { UserId } from "shared/src/Types"

export interface UserModel {
    id: UserId 
    username: string
    hash: string
    iconSrc: string
    created: Date
}

export type Status = 'created' | 'removed' | 'updated'

export type UserRequest = UserId
export type CheckUserWithUsername = string

export interface UserCreate {
    id: UserId
    username: string
    hash: string
}

export interface UserRemove {
    id: UserId
}

export interface PasswordUpdate {
    id: UserId
    newHash: string
}

export interface IconUpdate {
    id: UserId
    iconSrc: string
}

export type UserAction = UserCreate | UserRemove | PasswordUpdate | IconUpdate


/*
    - receiving request
    - making changes in cache
    - adding corresponding action to queue

    in parallel with time interval
    - cleaning queue with sending commands to db
*/

const getCache = () => {
    const map = new Map<UserId, UserModel>()
    const status = new Map<UserId, Status>() 
    const accessTime = new Map<UserId, number>()

    const has = async (req: UserId): Promise<boolean> => {throw new Error()}
    const hasWithUsername = async (req: UserId): Promise<boolean> => {throw new Error()} 

    const updatePassword = (req: PasswordUpdate): void => {throw new Error()}
    const updateIcon = (req: IconUpdate): void => { throw new Error() }

    const getInfo = (req: UserId): Omit<UserModel, 'hash'> => { throw new Error() }

    return { has, hasWithUsername, updatePassword, updateIcon, getInfo }
}



export const model = {

    create: async (action: UserCreated) => {
        throw new Error()
    },

    updatePassword: async (action: PasswordUpdated) => {
        throw new Error()
    },

    updateIcon: async (action: IconUpdated) => {
        throw new Error()
    },

    remove: async (action: UserRemoved) => {
        throw new Error()
    }
}