import db from '../config/db'
import { Chat, ChatId, DM, UserId } from "../types/Types"
import chats from './chats'

const model = {
    create: async(user1Id: UserId, user2Id: UserId) => {
        const chat = await chats.create(true)
        const [dm] = await db('dms').insert({id: chat.id, user1Id, user2Id}, ['*']) as DM[]
        return dm
    },

    remove: async(chatId: ChatId) => {
        const id = await chats.remove(chatId)
        return id
    },

    getById: async(chatId: ChatId) => {
        const dm = await db('dms').where('id', chatId).select('*').first() as DM
        return dm
    },

    getByUserIds: async(user1Id: UserId, user2Id: UserId) => {
        const dm = await db('dms')
            .where({user1Id: user1Id, user2Id: user2Id})
            .orWhere({user1Id: user2Id, user2Id: user1Id})
            .select('*')
            .first() as DM
        return dm
    },

    getAllByUserId: async(userId: UserId) => {
        const dms = await db('dms')
            .where('user1Id', userId)
            .orWhere('user2Id', userId)
            .select('*') as DM[]
        return dms
    }

}

export default model