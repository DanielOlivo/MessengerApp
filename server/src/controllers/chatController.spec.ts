process.env.NODE_ENV = 'test'

import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from '@jest/globals'
import db from '../config/db'
import {
    controller,
    userCache,
    chatCache,
    membershipCache,
    messageCache
} from './chatController'
import { User } from '../models/models'

describe('chat controller', () => {

    let user1: User

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    it('extracting user1 straight from db', async () => {
        const [ user ] = await db('users').where({username: 'user1'}).select('*')
        user1 = user
        expect(user1).toBeDefined()
        expect(user1.username).toEqual('user1')
    })

    it('user cache contains nothing', () => {
        expect(userCache.cache.count()).toEqual(0)
    })

    it('chat controller: user1 requests for contacts', async () => {
        const result = await controller.handleUsersRequest(user1.id)          
        expect(result).toBeDefined()
        const users = Object.values(result)
        expect(users.length).toEqual(1) 
    })

    it('user cache conains one item', () => {
        expect(userCache.cache.count()).toEqual(1)
    })

    it('chat cache contains one item', () => {
        expect(chatCache.cache.count()).toEqual(1)
    })

    it('membership cache contains two items', () => {
        expect(membershipCache.cache.count()).toEqual(2)
    })

    it('messages cache contains 10 items', () => {
        expect(messageCache.cache.count()).toEqual(10)
    })

    it('sanity', () => expect(true).toBeTruthy()) 


})