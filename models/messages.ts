import db from '../config/db'
import { ChatId, UserId, Message, MessageId } from "../types/Types"

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
    }, 

    getById: async (id: MessageId) => {
        const message = await db('messages').where({id}).select('*').first() as Message
        return message
    },

    getForUser: async(userId: UserId, chatId: ChatId) => {
        const result = await db.raw(`
            with mcreated as (
                select created from memberships 
                where memberships."userId" = '${userId}' and memberships."groupId" = '${chatId}'
            ), isdm as (
                select "isDm" from chats where chats.id = '${chatId}' 
            ), msgs as (
                select * from messages where messages."chatId" = '${chatId}'
            )
            select * from msgs
            where  (select * from isdm) or msgs.created >= (select * from mcreated)
            order by msgs.created DESC;
        `)

        return result.rows as Message[]
    }
}

export default model