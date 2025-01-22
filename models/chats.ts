import db from '../config/db'
import { Chat, ChatId } from '../types/Types'

const model = {
    create: async (isDm: boolean = true, created?: Date) => {
        const [chat] = await db('chats').insert({isDm, created}, ['*']) as Chat[]
        return chat
    },

    remove: async (chatId: ChatId) => {
        const [{id}]: Partial<Chat>[] = await db('chats').where('id', chatId).del(['*'])
        return id as ChatId
    },

    count: async () => {
        const [{count: _count}] = await db('chats')
            .count('id')
        return Number(_count);
    },

    getById: async(id: ChatId) => {
        const chat = await db('chats').where({id}).first() as Chat
        return chat
    }
}

export default model