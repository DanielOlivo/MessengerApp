import db from "../config/db";
import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import { getUserCache } from './users'

describe('user cache', () => {

    let cache: ReturnType<typeof getUserCache>

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()

        cache = getUserCache()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    it('search user1', async () => {
        const [ user1 ] = await cache.search('user1')
        expect(user1).toBeDefined()
        expect(user1.username).toEqual('user1')
        expect(cache.cache.count()).toEqual(1)
    })  

    it('search user2', async () => {
        const [ user2 ] = await cache.search('user2')
        expect(user2).toBeDefined()
        expect(user2.username).toBeDefined()
        expect(cache.cache.count()).toEqual(2)
    })

    it('search user1 again; count the same', async () => {
        await cache.search('user1')
        expect(cache.cache.count()).toEqual(2)
    })

})