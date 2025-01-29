process.env.NODE_ENV = 'test'

import {v4 as uuidv4} from 'uuid'
import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import db from '../config/db'
import users from '../models/users'
import chats from '../models/chats'
import dms from '../models/dms'
import messages from '../models/messages'
import groups from '../models/groups'
import memberships from '../models/memberships'
import { DbUser, Chat, DM, Group } from '../types/Types'

describe('basic scenario', () => {

    let user1: DbUser
    let user2: DbUser
    let user3: DbUser
    let dm12: DM
    let dm23: DM
    let dudes: Group

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    test('users: create user1', async () => {
        user1 = await users.create('user1', 'password')
        expect(user1).toBeDefined()
        expect(user1.username).toEqual('user1')
        expect(user1.hashed).toEqual('password')
    })

    test('users: create user2', async () => {
        user2 = await users.create('user2', 'password', "hi, i'm user")
        expect(user1).toBeDefined()
        expect(user1.username).toEqual('user1')
        expect(user1.hashed).toEqual('password')
        expect(user2.bio).toEqual("hi, i'm user")
    })

    test('users: getAll', async() => {
        const all = await users.getAll()
        expect(all).toBeDefined()
        expect(all.length).toEqual(2)
    })

    test('users: getById - user1', async() => {
        const user = await users.getById(user1.id)
        expect(user).toBeDefined()
        expect(user.id).toEqual(user1.id)
    })

    test('users: getById - user2', async() => {
        const user = await users.getById(user2.id)
        expect(user).toBeDefined()
        expect(user.id).toEqual(user2.id)
    })

    test('users: getById - nonexisting', async() => {
        const id = uuidv4()
        const user = await users.getById(id)
        expect(user).toBeUndefined()
    })

    test('users: searchByUsername - user1', async() => {
        const result = await users.searchByUsername(user1.username)
        expect(result.length).toEqual(1)
        const [user] = result
        expect(user.username).toEqual(user1.username)
        expect(user.hashed).toEqual(user1.hashed)
        expect(user.id).toEqual(user1.id)
    })

    test('users: searchByUsername - user', async () => {
        const result = await users.searchByUsername('user')
        expect(result.length).toEqual(2)
    })

    test('users: searchByUsername - nonexisting', async () => {
        const result = await users.searchByUsername('nonexisting')
        expect(result.length).toEqual(0)
    })

    test('dms: create (user1, user2)', async() => {
        const dm = await dms.create(user1.id, user2.id)
        expect(dm).toBeDefined()
        expect(dm.user1Id).toEqual(user1.id)
        expect(dm.user2Id).toEqual(user2.id)
        dm12 = dm
    })

    test('chats: count', async() => {
        const count = await chats.count()
        expect(count).toBeDefined()
        expect(count).toEqual(1)
    })

    test('dms: getById dm12', async() => {
        const dm = await dms.getById(dm12.id)
        expect(dm).toBeDefined()
        expect(dm.id).toEqual(dm12.id)
    })

    test('dms: get by user1, user2', async() => {
        const dm = await dms.getByUserIds(user1.id, user2.id)
        expect(dm).toBeDefined()
        expect(dm.id).toEqual(dm12.id)
    })

    test('dms: get by user2, user1', async() => {
        const dm = await dms.getByUserIds(user2.id, user1.id)
        expect(dm).toBeDefined()
        expect(dm.id).toEqual(dm12.id)
    })

    test('users: create user3', async () => {
        user3 = await users.create('user3', 'user3_password')
        expect(user3).toBeDefined()
    })

    test('dms: create (user2, user3)', async() => {
        dm23 = await dms.create(user2.id, user3.id)
        expect(dm23).toBeDefined()
        expect(dm23.user1Id).toEqual(user2.id)
        expect(dm23.user2Id).toEqual(user3.id)
    })

    test('chats: count = 2', async() => {
        const count = await chats.count()
        expect(count).toEqual(2)
    })

    test('dms: get by user2, user3', async() => {
        const dm = await dms.getByUserIds(user2.id, user3.id)
        expect(dm.id).toEqual(dm23.id)
    })

    test('dms: get by user3, user2', async() => {
        const dm = await dms.getByUserIds(user3.id, user2.id)
        expect(dm.id).toEqual(dm23.id)
    })

    test("dms: get dm between user1 and user3 (it doesn't exist)", async() => {
        const dm = await dms.getByUserIds(user1.id, user3.id)
        expect(dm).toBeUndefined()
    })

    test('messages: message in dm12 from user1', async() => {
        const msg = await messages.create(dm12.id, user1.id, 'hey, dude')
        expect(msg).toBeDefined()
        expect(msg.chatId).toEqual(dm12.id)
        expect(msg.userId).toEqual(user1.id)
        expect(msg.content).toEqual('hey, dude')
    })

    test('messages: message in dm12 from user2', async() => {
        const msg = await messages.create(dm12.id, user2.id, "what's up")
        expect(msg).toBeDefined()
        expect(msg.chatId).toEqual(dm12.id)
        expect(msg.userId).toEqual(user2.id)
        expect(msg.content).toEqual("what's up")
    })

    test('messages: getAllFrom dm12', async() => {
        const msgs = await messages.getAllFrom(dm12.id)
        expect(msgs.length).toEqual(2)
        expect(msgs[0].userId).toEqual(user2.id)
    })

    test('groups: user1 creates the group dudes', async() => {
        const {group, membership} = await groups.create(user1.id, 'dudes', getDateWithDelta(-1000 * 60 * 11))
        expect(group).toBeDefined()
        expect(membership).toBeDefined()
        expect(membership.groupId).toEqual(group.id)
        expect(membership.userId).toEqual(user1.id)
        expect(membership.isAdmin).toBeTruthy()
        expect(group.name).toEqual('dudes')

        dudes = group
    })

    test('groups: user1 sends message to "dudes"', async() => {
        const msg = await messages.create(dudes.id, user1.id, 'hi', getDateWithDelta(-1000 * 60 * 10))
        expect(msg).toBeDefined()
    })

    test("groups: user1 gets messages from 'dudes' (he gets one, his own)", async() => {
        const all = await groups.getMessagesFor(user1.id, dudes.id)
        expect(all).toBeDefined()
        expect(all.length).toEqual(1)
        const [msg] = all 
        expect(msg.chatId).toEqual(dudes.id)
        expect(msg.userId).toEqual(user1.id)
        expect(msg.content).toEqual('hi')
    })

    test('groups: user1 adds user2 to "dudes"', async () => {
        const membership = await groups.addToGroup(user2.id, dudes.id, getDateWithDelta(-1000 * 60 * 9))
        expect(membership).toBeDefined()
        expect(membership.userId).toEqual(user2.id)
        expect(membership.groupId).toEqual(dudes.id)
    })

    test('groups: user2 gets messages from "dudes" (he gets none)', async () => {
        const all = await groups.getMessagesFor(user2.id, dudes.id)
        expect(all).toBeDefined()
        expect(all.length).toEqual(0)
    })

    test('groups: user2 sends message to "dudes"', async() => {
        const msg = await messages.create(dudes.id, user2.id, 'hey', getDateWithDelta(-1000 * 60 * 8))
        expect(msg).toBeDefined()
    })

    test('groups: user2 gets messages from "dudes" (he gets one, his own)', async() => {
        const all = await groups.getMessagesFor(user2.id, dudes.id)
        expect(all).toBeDefined()
        expect(all.length).toEqual(1)
    })

    test('groups: changing role of user2', async() => {
        const membership = await memberships.get(user2.id, dudes.id)
        const membershipUpd = await memberships.changeRole(membership.id, true)
        expect(membershipUpd).toBeDefined()
        expect(membershipUpd.groupId).toEqual(dudes.id)
        expect(membershipUpd.userId).toEqual(user2.id)
        expect(membershipUpd.isAdmin).toBeTruthy()
    })

    test('groups: get all members (2)', async() => {
        const members = await groups.getAllMembers(dudes.id)
        expect(members).toBeDefined()
        expect(members.length).toEqual(2)
    })

    test('groups: add user3 to dudes', async() => {
        const membership = await groups.addToGroup(user3.id, dudes.id, getDateWithDelta(-1000 * 60 * 7))
        expect(membership).toBeDefined()
    })

    test('groups: user3 sends message to dudes', async() => {
        const msg = await messages.create(dudes.id, user3.id, "i'm third", getDateWithDelta(-1000 * 60 * 6))
        expect(msg).toBeDefined()
    })

    test('groups: user 3 gets messages (has one)', async() => {
        const msgs = await groups.getMessagesFor(user3.id, dudes.id)
        expect(msgs.length).toEqual(1)
    })

    test("groups: user2 gets messages (has two)", async() => {
        const msgs = await groups.getMessagesFor(user2.id, dudes.id)
        expect(msgs.length).toEqual(2)
    })

    test("groups: user1 gets messages (has three)", async () => {
        const msgs = await groups.getMessagesFor(user1.id, dudes.id)
        expect(msgs.length).toEqual(3)
    })

    test("groups: get all members (3)", async() => {
        const members = await groups.getAllMembers(dudes.id)
        expect(members.length).toEqual(3)
    })

    test("groups: remove user2 from the dudes", async() => {
        const membership = await groups.removeFromGroup(user2.id, dudes.id)
        expect(membership).toBeDefined()
        expect(membership.userId).toEqual(user2.id)
    })

    test('groups: get all members (2)', async() => {
        const members = await groups.getAllMembers(dudes.id)
        const count = await groups.count(dudes.id)
        expect(count).toBeDefined()
        expect(count).toEqual(2)
        expect(members.length).toEqual(count)
    })

    test('groups: dudes renamed to "dudes XD"', async() => {
        const updated = await groups.editName(dudes.id, 'dudes XD')
        expect(updated).toBeDefined()
        expect(updated.id).toEqual(dudes.id)
        expect(updated.name).toEqual('dudes XD')
    })

    // i'm here

    test('groups: dudes remove', async() => {
        const id = await chats.remove(dudes.id)
        expect(id).toBeDefined()
    })

    test('dms: remove chat between user1 and user2', async() => {
        const id = await chats.remove(dm12.id)
        expect(id).toBeDefined()
        expect(id).toEqual(dm12.id)
    })

    test('dms: remove chat between user2 and user3', async() => {
        const id = await chats.remove(dm23.id)
        expect(id).toBeDefined()
        expect(id).toEqual(dm23.id)
    })
    

    test('chats: count = 0', async() => {
        const count = await chats.count()
        expect(count).toEqual(0)
    })
    
    test('users: remove', async () => {
        const id = await users.remove(user1.id)
        expect(id).toBeDefined()
        expect(id).toEqual(user1.id)
    })

    test('sanity check', () => {
        expect(1).toEqual(1)
    })
})


function getDateWithDelta(delta: number){
    const now = new Date().getMilliseconds()
    return new Date(now + delta)
}