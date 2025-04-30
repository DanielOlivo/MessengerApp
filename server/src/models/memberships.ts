import db from '../config/db'
import { ChatId, MembershipId, UserId } from "@shared/Types"
import { Membership } from './models'

const model = {
    
    create: async(m: Membership): Promise<void> => {
        await db('memberships').insert(m)
    },

    udate: async(m: Membership): Promise<void> => {
        await db('memberships').where({id: m.id}).update(m)
    },

    remove: async(id: MembershipId): Promise<void> => {
        await db('memberships').where({id}).del()
    },

    getByChatId: async (chatId: ChatId): Promise<Membership[]> => {
        const ms = await db('memberships').where({chatId}).select('*')
        return ms
    },

    getByChatIds: async (ids: ChatId[]): Promise<Membership[]> => {
        const ms = await db('memberships').whereIn('chatId', ids).select('*')
        return ms
    },

    getByUserId: async (userId: UserId): Promise<Membership[]> => {
        const ms = await db('memberships').where({userId}).select('*')
        return ms
    },

    getById: async (id: MembershipId): Promise<Membership[]> => {
        const ms = await db('memberships').where({id}).select('*')
        return ms
    }

}

export default model