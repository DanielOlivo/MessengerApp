import db from '../config/db'
import { ChatId, Group, Membership, MembershipId, UserId, Message, GroupId } from '../types/Types'
import chats from './chats'
import memberships from './memberships'

const model = {
    create: async (userId: UserId, name?: string, created?: Date) => {
        const chat = await chats.create(false)
        const [group] = await db('groups')
            .insert({id: chat.id, name}, ['*']) as Group[]
        const membership = await memberships.create(userId, chat.id, true, created)
        return {group, membership}
    },

    editName: async (id: ChatId, name: string) => {
        const [group] = await db('groups')
            .where({id})
            .update({name}, ['*']) as [Group]
        return group
    },

    addToGroup: async (userId: UserId, groupId: ChatId, created?: Date) => {
        const membership = await memberships.create(userId, groupId, false, created)
        return membership
    },

    removeFromGroup: async(userId: UserId, chatId: ChatId) => {
        const [membership] = await db('memberships')
            .where({userId, groupId: chatId})
            .del(['*']) as Membership[]
        return membership
    },

    getById: async(chatId: ChatId) => {
        const group = await db('groups').where({id: chatId}).select('*').first() as Group
        return group
    },

    getAll: async () => {
        const groups = await db('groups').select('*') as Group[]
        return groups
    },

    getAllByUser: async(userId: UserId) => {
        const groups = await db('memberships')
            .join('groups', 'groups.id', '=', 'memberships.groupId')
            .where({userId})
            .select(['groupId', 'id', 'name', 'created'].map(n => 'groups.' + n)) as Group[]
        return groups
    },

    getMessagesFor: async(userId: UserId, chatId: ChatId) => {
        const msgs = await db('messages')
            .where({chatId})
            .andWhere('created', '>=', db('memberships').where({userId, groupId: chatId}).select('created'))
        return msgs
    },

    getAllMembers: async(groupId: ChatId) => {
        const memberships = await db('memberships')
            .where('groupId', groupId)
            .select('*') as Membership[]
        return memberships
    },

    count: async(groupId: ChatId) => {
        const [{count}] = await db('memberships').count('id').where({groupId})
        return Number(count)
    },

    // handleSearchByUser: async(userId: UserId) => {
    //     const result = await db('memberships')
    //         .join('groups', 'memberships.chatId', '=', 'groups.id')
    //         .where({userId})
    // }
    
}

export default model