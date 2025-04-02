import { UserId } from "./Types"
import { v4 as uuid } from 'uuid'
import { faker } from '@faker-js/faker'

export interface UserInfo {
    id: UserId
    name: string
    iconSrc: string
}

export type UserInfoCollection = { [P: UserId]: UserInfo }

export function getRandom(): UserInfo{
    return {
        id: uuid(),
        name: faker.internet.username(),
        iconSrc: ''
    }
}

export function getRandomUserInfoCollection(amount: number = 2): UserInfoCollection {
    const result: UserInfoCollection = {} 

    for(let i = 0; i < amount; i++){
        const info = getRandom()
        result[info.id] = info
    }
    return result
}