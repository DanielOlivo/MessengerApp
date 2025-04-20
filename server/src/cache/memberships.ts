import db from "../config/db";
import { getCache } from "../cache1";
import { UserId, ChatId } from '@shared/Types'
import membershipModel from '../models/memberships'
import { Membership } from "../models/models";

const cache = getCache<Membership>(m => m.id)

const getUserMemberships = async (userId: UserId) => await cache.get(
    'user=' + userId,
    () => membershipModel.getByUserId(userId),
    (m: Membership) => new Set([ `id=${m.id}`, `user=${userId}` ])
)

const getMembershipsOfUserContacts = async (userId: UserId, ids: ChatId[]) => await cache.get(
    'contacts-of=' + userId,
    () => membershipModel.getByChatIds(ids),
    (m: Membership) => new Set( [`id=${m.id}`, `user=${m.userId}`, 'contacts-of=${userId'] )
)

const getMembershipsForUsers = async (id1: UserId, id2: UserId) => await cache.get(
    `user1=${id1};user2=${id2}`,
    () => db('memberships').whereIn('userId', [id1, id2]).select('*'),
    (m: Membership) => new Set( [`id=${m.id}`] )
)

const insert = (membership: Membership) => cache.insert(
    membership,
    new Set( [`id=${membership.id}`, `chat=${membership.chatId}`] ),
    (m) => db('memberships').insert(m)
)


export default {
    getUserMemberships,
    getMembershipsOfUserContacts,
    getMembershipsForUsers,
    insert
}