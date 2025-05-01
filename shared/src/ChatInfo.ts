import { ChatId } from "./Types";
import { faker } from "@faker-js/faker/.";
import { v4 as uuid } from "uuid";

export interface ChatInfo {
    id: ChatId
    name: string
    iconSrc: string
    isGroup: boolean
}

export type ChatInfoCollection = { [P: ChatId]: ChatInfo }

export function getRandomChatInfo(): ChatInfo {
    return {
        id: uuid(),
        name: faker.lorem.words()
    }
}

export function getRandomChatInfoCollection(amount: number = 2): ChatInfoCollection {
    const result: ChatInfoCollection = {}

    for(let i = 0; i < amount; i++){
        const info = getRandomChatInfo()
        result[info.id] = info
    }

    return result
}

