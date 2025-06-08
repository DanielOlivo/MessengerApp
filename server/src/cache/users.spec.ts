process.env.NODE_ENV = 'test'

import db from "../config/db";
import { describe, it, expect, beforeAll, afterAll, afterEach, jest, beforeEach } from "@jest/globals";
import { UserCache, queries } from './users'
import { wait } from "../utils/wait";
import userModel from '../models/users'


describe('user cache', () => {

    let cache: UserCache

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()
    })

    beforeEach(() => {
        cache = new UserCache()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })


    it('search users', async () => {
        let result = await cache.search('user1')
        expect(result).toBeDefined()
        expect(result.length).toEqual(1)
        const [ user1 ] = result
        expect(user1).toBeDefined()
        expect(user1.username).toEqual('user1')

        expect(cache.items.size).toEqual(1)

        // find users with 'user' 
        result = await cache.search('user')

        expect(result.some(u => u.username === 'user1')).toBeTruthy()

        expect(cache.tagIds.has(queries.search('user1'))).toBeTruthy()
        expect(cache.tagIds.get(queries.search('user1'))!.has(user1.id)).toBeTruthy()

        expect(cache.tagIds.has(queries.search('user'))).toBeTruthy()
        expect(cache.tagIds.get(queries.search('user'))!.has(user1.id)).toBeTruthy()

        expect(result.length > 1).toBeTruthy()
    })  

    it('get and update', async () => {
        const getSpy = jest.spyOn(userModel, 'getById')
        const updateSpy = jest.spyOn(userModel, 'update')

        const [ user ] = await cache.search('user1')
        const [ user1 ] = await cache.getUserById(user.id)
        expect(user1).toBeDefined()
        expect(user1.id).toEqual(user.id)

        expect(getSpy).toBeCalledTimes(0) // search adds multiple tags, id=... too

        expect(cache.items.size).toEqual(1)

        const updatedHash = 'updated hash'
        user.hash = updatedHash
        cache.updateUser(user)
        expect(updateSpy).toBeCalledTimes(1)

        await wait(100)

        const [ user2 ] = await cache.getUserById(user.id)
        expect(user2.hash).toEqual(updatedHash)

        // check manually in db
        const [ dbUser ] = await userModel.getById(user.id)
        expect(dbUser).toBeDefined()
        expect(dbUser.hash).toEqual(updatedHash)
    })

    it('getUsersasContacts', async () => {
        const [user, ...others] = await userModel.getAll()
        expect(user).toBeDefined()
        expect(others).toBeDefined()
        expect(others.length > 0).toBeTruthy()

        const contacts = await cache.getUsersAsContacts(user.id, others.map(u => u.id))
        expect(contacts.length).toEqual(others.length)

        for(const contact of contacts){
            expect(cache.tagIds.has(queries.id(contact.id))).toBeTruthy()
            expect(cache.tagIds.has(queries.username(contact.username))).toBeTruthy()
            expect(cache.tagIds.get(queries.asContact(user.id))!.has(contact.id)).toBeTruthy()
        }
    }) 

})
