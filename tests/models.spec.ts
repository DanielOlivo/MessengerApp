process.env.NODE_ENV = 'test'

import {v4 as uuidv4} from 'uuid'
import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import db from '../config/db'
import users from '../models/users'
import chats from '../models/chats'
import dms from '../models/dms'
import { DbUser, Chat, DM } from '../types/Types'

describe('basic scenario', () => {

    let user1: DbUser
    let user2: DbUser
    let user3: DbUser
    let dm12: DM
    let dm23: DM

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

    // i'm here

    test('dms: remove chat between user1 and user2', async() => {
        const id = await chats.remove(dm12.id)
        expect(id).toBeDefined()
        expect(id).toEqual(dm12.id)
    })

    // test('chats: count = 0', async() => {
    //     const count = await chats.count()
    //     expect(count).toEqual(0)
    // })
    
    test('users: remove', async () => {
        const id = await users.remove(user1.id)
        expect(id).toBeDefined()
        expect(id).toEqual(user1.id)
    })

    test('sanity check', () => {
        expect(1).toEqual(1)
    })
})
