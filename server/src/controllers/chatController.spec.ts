process.env.NODE_ENV = 'test'

import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from '@jest/globals'
import db from '../config/db'
import {
    controller,
    userCache,
    chatCache,
    membershipCache,
    messageCache,
    chatInfoCache
} from './chatController'
import { User } from '../models/models'
import { queries as userQueries } from '../cache/users'
import { queries as chatQueries } from '../cache/chats'
import { queries as membershipQueries } from '../cache/memberships'


describe('chat controller', () => {

    let user1: User
    let user2: User
    let user3: User

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

    it('extracting user2', async () => {
        const [ user ] = await db('users').where({username: 'user2'}).select('*')
        user2 = user
        expect(user2).toBeDefined()
        expect(user2.username).toEqual('user2')
    })

    it('this gonna fail', () => expect(false).toBeTruthy())

    it('extracting user3', async () => {
        const user = await db('users').where({username: 'user3'}).first()
        expect(user).toBeDefined()
        user3 = user
    })

    it('user cache contains nothing', () => {
        expect(userCache.cache.count()).toEqual(0)
    })

    it('chat controller: user1 requests for contacts', async () => {
        const result = await controller.handleUsersRequest(user1.id)          
        expect(result).toBeDefined()
        const users = Object.values(result)
        expect(users.length).toEqual(1) 

        // membership cache queries
        const mQueries = membershipCache.cache.getAllTags()
        expect(mQueries.has(membershipQueries.ofUser(user1.id))).toBeTruthy()
        expect(mQueries.has(membershipQueries.ofUser(user2.id))).toBeTruthy()
        expect(mQueries.has(membershipQueries.contactOf(user1.id))).toBeTruthy()

        // user cache queries
        const uQueries = userCache.cache.getAllTags()
        expect(uQueries.has(userQueries.id(user2.id))).toBeTruthy()
        expect(uQueries.has(userQueries.asContact(user1.id))).toBeTruthy()

        // chat info cache queries
        const ciQueries = chatInfoCache.cache.getAllTags()
    })

    return

    it('user cache conains one item', () => {
        expect(userCache.cache.count()).toEqual(1)
    })

    it(`user cache contains specific queries`, () => {
        const queries = userCache.cache.getAllTags()
        expect(queries.size).toEqual(2)
        expect(queries.has(userQueries.asContact(user1.id)))
        expect(queries.has(userQueries.id(user2.id)))
    })

    it('chat cache contains one item and specific queries', () => {
        expect(chatCache.cache.count()).toEqual(1)

        const queries = chatCache.cache.getAllTags()
        expect(queries.size).toEqual(2)
        console.log(queries)
        expect(chatQueries.ofUser(user1.id) in queries).toBeTruthy()
    })

    it('membership cache contains two items', () => {
        expect(membershipCache.cache.count()).toEqual(2)
    })

    it('messages cache contains 10 items', () => {
        expect(messageCache.cache.count()).toEqual(10)
    })

    it('chat info cache contains one item', () => {
        expect(chatInfoCache.cache.count()).toEqual(1)
    })

    it('searching for user3', async () => {
        const result = await controller.handleSearch(user1.id, 'user3')
        expect(result).toBeDefined()
        expect(user3.id in result).toBeTruthy()
        
    })

    it('handle init loading', async () => {
        const result = await controller.handleInitLoading(user1.id)
        expect(result).toBeDefined()
    })   

    it('sanity', () => expect(true).toBeTruthy()) 


})