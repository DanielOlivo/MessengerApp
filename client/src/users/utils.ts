import { v4 as uuid } from 'uuid'
import { faker } from '@faker-js/faker';
import { getRandomHumanIcon } from '../assets/assets';
import { UserId, UserInfo } from "shared/src/Types";

export function getRandom(): UserInfo {
    return {
        id: uuid(),
        name: faker.internet.username(),
        iconSrc: getRandomHumanIcon()
    }
}

export function getRandomUsers(amount: number = 10): {[P: UserId]: UserInfo} {
    return Object.fromEntries(Array.from({length: amount}, () => 
        getRandom()).map(info => [info.id, info]))
}