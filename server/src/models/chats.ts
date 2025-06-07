import db from '@config/db'
import { ChatId, UserId } from '@shared/Types'
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
        const chats = await db('chats').where({id}).select('*')
        return chats
    },

    getByIds: async(ids: ChatId[]): Promise<Chat[]> => {
        const chats = await db('chats').whereIn('id', ids).select('*')
        return chats
    },

    getDmBetween: async (id1: UserId, id2: UserId): Promise<Chat[]> => {
        const result = await db
            .with('user1m', db('memberships').where({userId: id1}))
            .with('user2m', db('memberships').where({userId: id2}))
            .with('joined',
                db('user1m')
                .innerJoin('user2m', 'user1m.chatId', '=', 'user2m.chatId')
                .select('user1m.chatId as id')
            )
            .select('chats.*').from('joined')
            .join('chats', 'chats.id', '=', 'joined.id')
            .where('isGroup', false)
        return result
    }
}

export default model