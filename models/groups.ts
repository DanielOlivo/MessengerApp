import db from '../config/db'
import { ChatId, Group, Membership, MembershipId, UserId, Message, GroupId } from '../types/Types'
import chats from './chats'
import memberships from './memberships'

const model = {
    create: async (userId: UserId, name?: string, created?: Date) => {
        // const chat = await chats.create(false)
        // const [group] = await db('groups')
        //     .insert({id: chat.id, name}, ['*']) as Group[]
        // const membership = await memberships.create(userId, chat.id, true, created)

        const result = await db.raw(`
            with id as (
                insert into chats("isDm") values (false) returning id
            ), gr as (
                insert into groups(id, name) values (
                    (select * from id),
                    'dudes'
                ) returning id, name, created
            ), user1 as (
                select id from users where username = 'user1'
            ), member as (
                insert into memberships ("groupId", "userId", "isAdmin") values (
                    (select * from id),
                    (select * from user1),
                    true
                ) returning id, "groupId", "userId", "isAdmin", created
            )
            select gr.id as group_id, gr.name, gr.created as group_created, member.id as member_id, member."groupId", member."userId", member."isAdmin", member.created as member_created
            from gr 
            join member on gr.id = member."groupId";
        `)

        // console.log(result.rows[0])

        const group: Group = {
            id: result.rows[0].group_id,
            name: result.rows[0].name,
            created: result.rows[0].group_created
        }

        // console.log(group)

        const membership: Membership = {
            id: result.rows[0].member_id,
            groupId: result.rows[0].groupId,
            userId: result.rows[0].userId,
            created: result.rows[0].member_created,
            isAdmin: result.rows[0].isAdmin
        }

        console.log(group, membership)

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