import db from '../config/db'
import { MessageId, ChatId, UserId, Unread } from "../types/Types"

const model = {
    createForUser: async(userId: UserId, messageId: MessageId) => {
        const [unread] = await db('unread')
            .insert({userId, messageId}, ['*']) as Unread[]
        return unread

    },

    remove: async(userId: UserId, messageId: MessageId) => {
        const result = await db('unread')
            .where({userId, messageId})
        return
    }

    // createForDm: async (chatId: ChatId, messageId: MessageId) => {
    //     const result = db('unread')
    //         .insert([
    //             {}
    //         ])
    // }
}

export default model