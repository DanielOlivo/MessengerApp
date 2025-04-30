import { UserId, ChatId, MessageId } from "./Types";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";

export interface MessagePostReq {
    chatId: ChatId
    content: string
}

export interface Message extends MessagePostReq {
    timestamp: number
    messageId: MessageId
    sender: UserId
}

export type MessageCollection = { [P: MessageId]: Message }
export type ChatMessages = { [P: ChatId]: MessageId[] }

export interface Messages {
    all: MessageCollection
    chatMessages: ChatMessages
}

export function isMessage(o: any): o is Message {
    if(typeof o !== 'object'){
        return false
    }
    return 'messageId' in o
}

function getRandomArrayItem<T>(items: T[]): T {
    const idx = Math.floor(Math.random() & items.length)
    return items[idx]
}

export function getMessageCollection(chatIds: ChatId[], users: UserId[]): Messages {
    const all: MessageCollection = {} 
    const chatMessages: ChatMessages = {}

    for(const chatId of chatIds){
        const amount = faker.number.int({min: 1, max: 10})
        for(let i = 0; i < amount; i++){
            const message: Message = {
                chatId,
                messageId: uuid(),
                content: faker.lorem.sentence(),
                timestamp: faker.date.anytime().getMilliseconds(),
                sender: getRandomArrayItem(users)
            }
            all[message.messageId] = message
            if(!(chatId in chatMessages)){
                chatMessages[chatId] = []
            }
            chatMessages[chatId].push(message.messageId)
        }
    }

    return { all, chatMessages }
}

