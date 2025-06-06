import { Cache} from "./cache";
import { UserId, ChatId, MembershipId } from '@shared/Types'
import membershipModel from '../models/memberships'
import { Membership } from "../models/models";

export const queries = {
    id: (id: string) => `id=${id}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`,
    ofChat: (chatId: ChatId) => `ofchat=${chatId}`,
    contactOf: (userId: UserId) => `contact-of=${userId}`
}

export class MembershipCache extends Cache<Membership> {
    constructor(fn: (m: Membership) => string) {
        super(fn)
    }

    getUserMemberships = async (userId: UserId) => await this.get(
        queries.ofUser(userId),
        async () => await membershipModel.getByUserId(userId),
        (m: Membership) => [ 
            queries.id(m.id), 
            queries.ofUser(m.userId), 
        ]
    )

    getMembershipsOfUserContacts = async (userId: UserId, ids: ChatId[]) => await this.get(
        queries.contactOf(userId),
        async () => await membershipModel.getByChatIds(ids),
        (m: Membership) => [
            queries.id(m.id), 
            queries.contactOf(userId)
        ]
    )

    getChatMemberships = async (chatId: ChatId) => await this.get(
        queries.ofChat(chatId),
        async () => await membershipModel.getByChatId(chatId),
        (m) => [
            queries.id(m.id), 
            queries.ofChat(m.chatId),
        ]
    )

    insertMembership = async (membership: Membership) => this.insert(
        membership,
        [ queries.id(membership.id) ],
        async () => await membershipModel.create(membership)
    )

    removeMembership = (id: MembershipId) => this.removeById(
        id,
        async () => await membershipModel.remove(id)
    )
}