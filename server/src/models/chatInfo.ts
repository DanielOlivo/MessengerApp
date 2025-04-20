import db from "../config/db";
import { ChatId } from "shared/src/Types";
import { ChatInfo } from "./models";

const model = {

    create: async (info: ChatInfo): Promise<void> => {
        await db('chatinfo').insert(info)
    },

    update: async (info: ChatInfo): Promise<void> => {
        await db('chatinfo').where({id: info.id}).update(info)
    },

    remove: async (info: ChatInfo): Promise<void> => {
        await db('chatinfo').where({id: info.id}).del()
    },

    getById: async (id: string): Promise<ChatInfo[]> => {
        const info = db('chatinfo').where({id}).select('*')
        return info
    },

    getByChatIds: async (ids: ChatId[]): Promise<ChatInfo[]> => {
        const info = db('chatinfo').whereIn('chatId', ids).select('*')
        return info
    }

}

export default model