import db from '../config/db'
import { ChatId, MessageId, UserId } from "@shared/Types"
import { Message } from './models'

const model = {

    create: async (m: Message): Promise<void> => {
        // await db('messages').insert(m)
        await db.transaction(trx => trx('messages').insert(m))
    },

    update: async (m: Message): Promise<void> => {
        // await db('messages').where({id: m.id}).update(m)
        await db.transaction(trx =>
            trx('messages').where({id: m.id}).update(m)
        )
    },

    remove: async (m: Message): Promise<void> => {
        // await db('messages').where({id: m.id}).del()
        await db.transaction(trx =>
            trx('messages').where({id: m.id}).del()
        )
    },

    getById: async(id: MessageId): Promise<Message[]> => {
        const messages = await db('messages').where({id}).select('*')
        return messages
    },

    getByChatId: async (chatId: ChatId): Promise<Message[]> => {
        const messages = await db('messages')
            .where({chatId})
            .orderBy('timestamp', 'desc')
            .select('*')
        return messages
    },

    getByChatIds: async (ids: ChatId[]): Promise<Message[]> => {
        const messages = await db('messages').whereIn('chatId', ids).select('*')
        return messages
    },

    getForUser: async (userId: UserId): Promise<Message[]> => {
        const messages = await db
            .with('chatIds', db('memberships').where({userId}).select('chatId as id'))
            .with('msgs', db('messages').whereIn('chatId', db('chatIds')))
            .select(['msgs.id', 'msgs.chatId', 'msgs.userId', 'msgs.timestamp', 'msgs.content']).from('msgs'),
        return messages
    }

}

export default model
