import db from '../config/db'
import { ChatId, MessageId } from "@shared/Types"
import { Message } from './models'

const model = {

    create: async (m: Message): Promise<void> => {
        await db('messages').insert(m)
    },

    update: async (m: Message): Promise<void> => {
        await db('messages').where({id: m.id}).update(m)
    },

    remove: async (m: Message): Promise<void> => {
        await db('messages').where({id: m.id}).del()
    },

    getById: async(id: MessageId): Promise<Message[]> => {
        const messages = await db('messages').where({id}).select('*')
        return messages
    },

    getByChatId: async (chatId: ChatId): Promise<Message[]> => {
        const messages = await db('messages').where({chatId}).select('*')
        return messages
    },

    getByChatIds: async (ids: ChatId[]): Promise<Message[]> => {
        const messages = await db('messages').whereIn('chatId', ids).select('*')
        return messages
    },

}

export default model
