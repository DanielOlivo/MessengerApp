import db from "../config/db";
import { getCache } from "../cache1";
import { UserId, ChatId, MembershipId } from '@shared/Types'
import membershipModel from '../models/memberships'
import { Membership } from "../models/models";

export const queries = {
    id: (id: string) => `id=${id}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`,
    ofChat: (chatId: ChatId) => `ofchat=${chatId}`,
    contactOf: (userId: UserId) => `contact-of=${userId}`
}

const cache = getCache<Membership>(m => m.id)

const getUserMemberships = async (userId: UserId) => await cache.get(
    queries.ofUser(userId),
    async () => await db('memberships').where({userId}),
    (m: Membership) => new Set([ queries.id(m.id), queries.ofUser(m.userId) ])
)

const getMembershipsOfUserContacts = async (userId: UserId, ids: ChatId[]) => await cache.get(
    queries.contactOf(userId),
    () => membershipModel.getByChatIds(ids),
    (m: Membership) => new Set( [queries.id(m.id), queries.contactOf(userId)] )
)

const getMembershipsForUsers = async (id1: UserId, id2: UserId) => await cache.get(
    `user1=${id1};user2=${id2}`,
    () => db('memberships').whereIn('userId', [id1, id2]).select('*'),
    (m: Membership) => new Set( [`id=${m.id}`] )
)

const getChatMemberships = async (chatId: ChatId) => await cache.get(
    queries.ofChat(chatId),
    () => membershipModel.getByChatId(chatId),
    (m) => new Set( [queries.id(m.id), queries.ofChat(m.chatId)] )
)

const insert = async (membership: Membership) => await cache.insert(
    membership,
    new Set( [`id=${membership.id}`, `chat=${membership.chatId}`] ),
    async (m) => await db('memberships').insert(m)
)

const remove = (membership: Membership) => cache.removeById(
    membership.id,
    async (id) => await db('memberships').where({id}).del()
)

export function getMembershipCache() {
    return {
        getUserMemberships,
        getChatMemberships,
        getMembershipsOfUserContacts,
        getMembershipsForUsers,
        insert,
        remove,
        cache
    }
}