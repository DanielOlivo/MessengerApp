process.env.NODE_ENV = 'test'

import { v4 as uuid } from 'uuid'
import { describe, it, expect, beforeAll, afterAll, jest, afterEach } from "@jest/globals";
import db from './config/db'
import { getCache } from "./cache1";
import { DbUser } from "shared/src/Types";
import UserModel from "./models/UserModel";
import dayjs from 'dayjs';

describe('getCache1', () => {
    const getId = (user: DbUser) => user.id
    const cache = getCache<DbUser>(getId)

    const dbFns = {
        getByUsernameDb: async (username: string) => await db('users').where({username}),
        getWhereUsernameStartsWithDb: async (term: string) => await db('users').where('username', 'like', `${term}%`) as DbUser[],

        create: async(item: DbUser) => await db('users').insert(item),
        remove: async(item: DbUser) => await db('users').where({id: item.id}).del(),
        update: async(item: DbUser) => await db('users').where({id: item.id}).update(item)
    }

    const cacheFns = {
        getUsername: (username: string) => (user: DbUser) => user.username === username,
        getWhereUsernameStartsWith: (term: string) => (user: DbUser) => user.username.startsWith(term)
    }

    const getByUsername = async (username: string) => {
        const label = 'username=' + username
        return cache.get(label, () => dbFns.getByUsernameDb(username))
    }

    const getWhereUsernameStartsWith = async (term: string) => {
        const label='startswith=' + term
        return cache.get(label, () => dbFns.getWhereUsernameStartsWithDb(term))
    }

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

    it('get all users', async () => {
        const users: DbUser[] = await db('users').select('*')
        expect(users.length > 0).toBeTruthy()
    })

    // get user1; get all labels; check count 
    it('get user1', async () => {
        const users = await getByUsername('user1')
        expect(users).toBeDefined()
        expect(users.length).toEqual(1)
        expect(users[0].username).toEqual('user1')
        expect(cache.count()).toEqual(1)
    })

    // get user2; get all labels; check count
    it('get user2', async () => {
        const users = await getByUsername('user2')
        expect(users).toBeDefined()
        expect(users.length).toEqual(1)
        expect(users[0].username).toEqual('user2')
        expect(cache.count()).toEqual(2)
    })

    // get all which starts with 'user'
    it('get all starts with "user"', async () => {
        const result = await getWhereUsernameStartsWith('user')
        expect(result).toBeDefined()
        expect(result.length).toEqual(4)
        expect(cache.count()).toEqual(4)
    })

    it('get user1 again', async () => {
        const getter = jest.spyOn(dbFns, 'getByUsernameDb')
        const users = await getByUsername('user1')
        expect(users).toBeDefined()
        expect(users.length).toEqual(1)
        expect(getter).not.toHaveBeenCalled()
    })

    it('getting user4; despite existing in cache, getter will called again', async () => {
        const getter = jest.spyOn(dbFns, 'getByUsernameDb')
        const users = await getByUsername('user4')
        expect(users).toBeDefined()
        expect(users.length).toEqual(1)
        expect(getter).toHaveBeenCalled()
    })

    it('all labels so far', () => {
        const expected = new Set([
            'username=user1',
            'username=user2',
            'startswith=user'
        ])

        const actual = cache.getAllLabels()
        for(const label of expected){
            expect(actual.has(label)).toBeTruthy()
        }
    })

    it('craete user5', async () => {
        const user: DbUser = {
            id: uuid(),
            username: 'user5',
            hashed: 'hashed password',
            created: new Date(),
        }

        const getter = jest.spyOn(dbFns, 'getByUsernameDb')
        cache.create(user, ['username=user5', 'startswith=user'])
        expect(cache.count()).toEqual(5)

        const extracted = await getByUsername('user5')
        expect(extracted).toBeDefined()
        expect(extracted.length).toEqual(1)
        expect(getter).not.toHaveBeenCalled()

        const extracted2 = await getWhereUsernameStartsWith('user')
        expect(extracted2.length).toEqual(5)

        expect(cache.count()).toEqual(5)
        expect(cache.count('c')).toEqual(1)
        expect(cache.count('u')).toEqual(0)
        expect(cache.count('d')).toEqual(0)
    })




    it('sanity', () => expect(true).toBeTruthy())
})