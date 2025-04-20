import db from '@config/db'
import { ChatId } from '@shared/Types'
import { Chat } from './models'

const model = {
    create: async (chat: Chat): Promise<void> => {
        await db('chats').insert(chat)
    },

    update: async (updated: Chat): Promise<void> => {
        await db('chats').where({id: updated.id}).update(updated)
    },

    remove: async (chatId: ChatId): Promise<void> => {
        await db('chats').where('id', chatId).del()
    },

    count: async (): Promise<number> => {
        const [{count: _count}] = await db('chats')
            .count('id')
        return Number(_count);
    },

    getById: async(id: ChatId): Promise<Chat[]> => {
        const chats = await db('chats').where({id})
        return chats
    },

    getByIds: async(ids: ChatId[]): Promise<Chat[]> => {
        const chats = await db('chats').whereIn('id', ids).select('*')
        return chats
    }
}

export default model