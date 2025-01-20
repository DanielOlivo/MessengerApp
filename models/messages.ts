import db from '../config/db'
import { ChatId, UserId, Message } from "../types/Types"

const model = {

    create: async(chatId: ChatId, userId: UserId, content: string, created?: Date) => {
        const [message] = await db('messages')
            .insert({chatId, userId, content, created}, ['*']) as Message[]
        return message
    },

    getAllFrom: async (chatId: ChatId) => {
        const messages = await db('messages')
            .orderBy('created', 'desc')
            .where({chatId})
            .select('*') as Message[]
        return messages
    } 
}

export default model