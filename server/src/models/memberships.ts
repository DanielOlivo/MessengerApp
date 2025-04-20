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

    getByChatId: (chatId: ChatId): Promise<Membership[]> => {
        const ms = db('memberships').where({chatId}).select('*')
        return ms
    },

    getByUserId: (userId: UserId): Promise<Membership[]> => {
        const ms = db('memberships').where({userId}).select('*')
        return ms
    },

    getById: (id: MembershipId): Promise<Membership[]> => {
        const ms = db('memberships').where({id}).select('*')
        return ms
    }

}

export default model