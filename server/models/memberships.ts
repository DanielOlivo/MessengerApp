import db from '../config/db'
import { ChatId, Membership, MembershipId, UserId } from "../types/Types"

const model = {
    
    create: async(userId: UserId, groupId: ChatId, isAdmin: boolean, created?: Date) => {
        const [membership] = await db('memberships')
            .insert({userId, groupId, isAdmin, created}, ['*']) as Membership[]
        return membership
    },


    changeRole: async(membershipId: MembershipId, isAdmin: boolean) => {
        const [membership] = await db('memberships')
            .where('id', membershipId)
            .update({isAdmin}, ['*']) as Membership[]
        return membership;
    },

    remove: async(memId: MembershipId) => {
        const [{id}]: Partial<Membership>[] = await db('memberships')
            .where('id', memId)
            .del(['*'])
        return id as MembershipId
    },

    removeByUserIdChatId: async(userId: UserId, chatId: ChatId) => {
        const [{id}]: Partial<Membership>[] = await db('memberships').where({userId, chatId}).del(['id'])
        return id as MembershipId
    },

    get: async(userId: UserId, groupId: ChatId) => {
        const membership = await db('memberships')
            .where({userId, groupId})
            .first() as Membership
        return membership
    }
}

export default model