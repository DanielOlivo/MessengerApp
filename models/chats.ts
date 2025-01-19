import db from '../config/db'
import { Chat, ChatId } from '../types/Types'

const model = {
    create: async (isDm: boolean = true) => {
        const [chat] = await db('chats').insert({isDm}, ['*']) as Chat[]
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
    } 
}

export default model