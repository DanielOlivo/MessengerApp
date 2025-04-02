import { UserId } from "./Types"
import { v4 as uuid } from 'uuid'
import { faker } from '@faker-js/faker'

export interface UserInfo {
    id: UserId
    name: string
    iconSrc: string
}

export function getRandom(): UserInfo{
    return {
        id: uuid(),
        name: faker.internet.username(),
        iconSrc: ''
    }
}