import { getCache } from "../cache1";
import { UserId, ChatId } from '@shared/Types'
import membershipModel from '../models/memberships'
import { Membership } from "../models/models";

const cache = getCache<Membership>(m => m.id)

const getUserMemberships = async (userId: UserId) => await cache.get(
    'user=' + userId,
    () => membershipModel.getByUserId(userId),
    (m: Membership) => new Set([ `id=${m.id}`, `user=${userId}`, `chat=${m.chatId}` ])
)

const getMembershipsOfUserContacts = async (userId: UserId, ids: ChatId[]) => await cache.get(
    'contacts-of=' + userId,
    () => membershipModel.getByChatIds(ids),
    (m: Membership) => new Set( [`id=${m.id}`, `user=${m.userId}`, 'contacts-of=${userId'] )
)



export default {
    getUserMemberships,
    getMembershipsOfUserContacts
}