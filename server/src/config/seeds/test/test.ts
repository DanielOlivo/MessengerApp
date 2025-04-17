process.env.NODE_ENV='test'

import { Knex } from "knex";
import {hash} from 'bcrypt'

import userModel from '../../../models/users'
import dmModel from '../../../models/dms'
import groupModel from '../../../models/groups'
import messageModel from '../../../models/messages'
import membershipModel from '../../../models/memberships'
import unreadModel from '../../../models/unread'

export async function seed(knex: Knex): Promise<void> {

    // const getDate = getDateGen()

    // three users
    const user1 = await userModel.create('user1', 'hashed', "i'm user1")
    const user2 = await userModel.create('user2', 'hashed', "i'm user2")
    const user3 = await userModel.create('user3', 'hashed', "i'm user3")

    const user4 = await userModel.create('user4', 'hashed', "I'm fourth and has no access to chats")

    // one dm
    // const dm12 = await dmModel.create(user1.id, user2.id)

    // one group
    // const {group, membership: membership1} = await groupModel.create(user1.id, 'dudes', getDate())
    // const membership2 = await membershipModel.create(user2.id, group.id, false, getDate())
    // const membership3 = await membershipModel.create(user3.id, group.id, false, getDate())

    // messages
    // const msg1 = await messageModel.create(dm12.id, user1.id, 'hey', getDate())
    // const msg2 = await messageModel.create(dm12.id, user1.id, 'whats up', getDate())

    // const msg3 = await messageModel.create(group.id, user1.id, 'first', getDate())
    // const msg4 = await messageModel.create(group.id, user2.id, 'second', getDate())
    // const msg5 = await messageModel.create(group.id, user3.id, 'third', getDate())

    // const unread1 = await unreadModel.createForUser(user1.id, msg4.messageId)

};

function getDateGen() {
    const now = Date.now()
    let counter = 0
    return function getDate() {
        return new Date(now - 1000 * 60 * 60 * (24 * 200 - (12 * counter++)))
    }
}