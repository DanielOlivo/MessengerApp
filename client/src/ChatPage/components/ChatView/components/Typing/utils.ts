import { v4 as uuid} from 'uuid'
import { faker } from "@faker-js/faker";
import { ChatId, Typing } from "shared/src/Types";
import dayjs from 'dayjs';

export type Typings = {[P in ChatId]: Typing[]}

export const DefaultTypings: Typings = {}

export function getActiveTyping(): Typing {
    const username = faker.internet.username()
    const userId = uuid()
    const chatId = uuid()
    const timestamp = dayjs().add(10, 'days').valueOf()

    return {username, userId, timestamp, chatId}
}

export function getNonactiveTyping(): Typing {
    return {
        username: faker.internet.username(),
        userId: uuid(),
        chatId: uuid(),
        timestamp: dayjs().subtract(3, 'seconds').valueOf()
    }
}

export function join(names: string[]): string {
    return names.slice(0, -1).join(', ') + ' and ' + names[names.length - 1]
}

