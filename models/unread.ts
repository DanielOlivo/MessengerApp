import knex from 'knex'
import db from '../config/db'
import { DM, Message, MessageId, ChatId, UserId } from "../types/Types"

export type UnreadId = string

export interface Unread {
    id: UnreadId
    userId: UserId 
    messageId: MessageId
}


const model = {
    createForUser: async(userId: UserId, messageId: MessageId) => {
        const [unread] = await db('unread')
            .insert({userId, messageId}, ['*']) as Unread[]
        return unread

    },

    createForUsers: async(userIds: UserId[], messageId: MessageId) => {
        const unreads = await db('unread')
            .insert(userIds.map((id) => {
                return {userId: id, messageId}
            }), ['*']) as Unread[]
        return unreads
    },

    createForDm: async(id: ChatId, messageId: MessageId) => {
        const {user1Id, user2Id}: Partial<DM> = await db('dms').where({id}).select('user1Id', 'user2Id').first()
        const unread = await db('unread').insert([
            {messageId, userId: user1Id},
            {messageId, userId: user2Id}
        ], ['*']) as Unread[]
        // console.log(unread)
        return unread
    },

    createForGroup: async(groupId: ChatId, messageId: MessageId) => {

        const unread = await db('unread').insert({
            messageId: messageId,
            userId: db('memberships').where({groupId}).select('userId')
        }, ['*'])

        return unread
    },

    removeById: async(id: UnreadId) => {
        const [unread] = await db('unread').where({id}).del(['*']) as Unread[]
        console.log('removed unread:', unread)
        return unread
    },

    remove: async(userId: UserId, messageId: MessageId) => {
        const [unread] = await db('unread')
            .where({userId, messageId})
            .del(['*']) as Unread[]
        return unread
    },

    get: async(userId: UserId) => {
        const messages = await db('unread')
            .leftJoin('messages', 'unread.messageId', '=', 'messages.id')
            .where('unread.userId', userId)
            .select("messages.*") as Message[]
        return messages
    },

    getAll: async() => {
        return await db('unread').select(['*']) as Unread[]
    }
    // createForDm: async (chatId: ChatId, messageId: MessageId) => {
    //     const result = db('unread')
    //         .insert([
    //             {}
    //         ])
    // }
}

export default model