process.env.NODE_ENV = 'test'

import { v4 as uuid } from 'uuid'
import { describe, it, expect, beforeAll, afterAll, jest, afterEach, beforeEach } from "@jest/globals";
import db from '../config/db'
import { getCache, Cache } from "./cache";
import { DbUser } from "shared/src/Types";
import UserModel from "./models/UserModel";
import dayjs from 'dayjs';
import { wait } from '@shared/utils';


interface Data {
    id: number
    count: number
}

describe('Cache class tests', () => {
    let cache: Cache<Data>    
    let db: ReturnType<typeof useFakeDb>
    let getItemById: (id: number) => Promise<Data[]>
    let insertItem: (item: Data) => void
    let updateItem: (item: Data) => void
    let removeItem: (item: Data) => void

    let getWithIdLess: (n: number) => Promise<Data[]>

    const queries = {
        byId: (id: number) => `num=${id}`,
        lessThan: (n: number) => `less=${n}`
    }

    beforeAll(async () => {
        getItemById = async (id: number) =>  await cache.get(
            queries.byId(id),
            async () => await db.getById(id),
            (item: Data) => [ queries.byId(item.id) ]
        )

        getWithIdLess = async (n: number) => await cache.get(
            queries.lessThan(n),
            () => db.getWithIdLess(n),
            (item: Data) => [ queries.byId(item.id), queries.lessThan(n) ]
        )

        insertItem = (item: Data) => cache.insert(
            item,
            [ queries.byId(item.id) ],
            db.insert
        )

        updateItem = (item: Data) => cache.update(
            item,
            db.update
        )

        removeItem = (item: Data) => cache.remove(
            item, 
            db.remove
        )
    })

    beforeEach(() => {
        db = useFakeDb()
        cache = new Cache<Data>((d: Data) => d.id)
    })

    it('fake db returns item with id=1', async () => {
        const spy = jest.spyOn(db, 'getById') 
        const [ {id, count} ] = await db.getById(1)
        expect(spy).toBeCalled()
        expect(id).toEqual(1)
        expect(count).toEqual(0)
    }) 

    it('get', async() => {
        const spy = jest.spyOn(db, 'getById')
        const [ {id, count} ] = await getItemById(1)
        expect(spy).toBeCalledTimes(1)
        expect(id).toEqual(1)
        expect(count).toEqual(0)

        expect(cache.requests.has(queries.byId(1))).toBeTruthy()
        const reqTime1 = cache.requests.get(queries.byId(1))

        expect(cache.items.size).toEqual(1)
        expect(cache.idTags.size).toEqual(1)
        expect(cache.tagIds.size).toEqual(1)
        expect(cache.items.has(1)).toBeTruthy()
        expect(cache.tagIds.has(queries.byId(1))).toBeTruthy()
        expect(cache.idTags.has(1)).toBeTruthy()

        // second time
        const [item] = await getItemById(1)
        expect(spy).toBeCalledTimes(1)
        expect(item.id).toEqual(1)
        expect(item.count).toEqual(0)
        const reqTime2 = cache.requests.get(queries.byId(1))
        expect(reqTime1).not.toEqual(reqTime2)

        // extract item with different id
        const [ item2 ] = await getItemById(2)
        expect(spy).toBeCalledTimes(2)
        expect(item2.id).toEqual(2)
        expect(item2.count).toEqual(0)
        expect(cache.items.size).toEqual(2)
        expect(cache.items.has(2)).toBeTruthy()
        expect(cache.idTags.has(2)).toBeTruthy()
        expect(cache.tagIds.has(queries.byId(2))).toBeTruthy()
        expect(cache.requests.has(queries.byId(2))).toBeTruthy()
    })


    it('insert', async() => {
        const insertSpy = jest.spyOn(db, 'insert')
        const getSpy = jest.spyOn(db, 'getById')

        const newItem: Data = {id: 11, count: 2}
        
        expect(cache.items.size).toEqual(0)
        expect(cache.idTags.size).toEqual(0)
        expect(cache.tagIds.size).toEqual(0)

        insertItem(newItem)

        expect(insertSpy).toBeCalledTimes(1)
        expect(getSpy).toBeCalledTimes(0)
        expect(cache.items.size).toEqual(1)
        expect(cache.idTags.size).toEqual(1)
        expect(cache.tagIds.size).toEqual(1)

        const [ item ] = await getItemById(11)
        expect(item.id).toEqual(newItem.id)
        expect(item.count).toEqual(newItem.count)
        expect(insertSpy).toBeCalledTimes(1)
        expect(getSpy).toBeCalledTimes(0)
    })


    it('update', async () => {
        const updateSpy = jest.spyOn(db, 'update')

        const [ item ] = await getItemById(1)
        expect(item.id).toEqual(1)
        expect(item.count).toEqual(0)

        item.count = 2
        updateItem(item)
        expect(updateSpy).toBeCalledTimes(1)

        const [ dbItem ] = await db.getById(1) 
        expect(dbItem.id).toEqual(1)
        expect(dbItem.count).toEqual(2)
    }) 

    it('rmeove', async () => {
        const removeSpy = jest.spyOn(db, 'remove')

        const [ item ] = await getItemById(1)
        expect(item).toBeDefined() 
        expect(cache.items.size).toEqual(1)

        removeItem(item)
        expect(removeSpy).toBeCalledTimes(1)

        const arr = await getItemById(1)
        expect(arr.length).toEqual(0)
        expect(cache.items.size).toEqual(0)
    })

    it('overlapping queries', async () => {
        const [ item1 ] = await getItemById(1)
        expect(item1).toBeDefined()

        const items = await (await getWithIdLess(3))
        const other1 = items.find(i => i.id === 1)!
        const item2 = items.find(i => i.id === 2)!

        expect(other1).toBeDefined()
        expect(other1.id).toEqual(1)

        expect(item2).toBeDefined()
        expect(item2.id).toEqual(2) 

        expect(cache.items.size).toEqual(2)

        expect(cache.tagIds.has(queries.byId(1))).toBeTruthy()
        expect(cache.tagIds.has(queries.byId(2))).toBeTruthy()
        expect(cache.tagIds.has(queries.lessThan(3))).toBeTruthy()

        expect(cache.idTags.get(1)!.has(queries.byId(1))).toBeTruthy()
        expect(cache.idTags.get(2)!.has(queries.byId(2))).toBeTruthy()
        expect(cache.idTags.get(1)!.has(queries.lessThan(3))).toBeTruthy()
        expect(cache.idTags.get(2)!.has(queries.lessThan(3))).toBeTruthy()
    })


})

function useFakeDb(){
    const db = new Map<number, number>(Array.from({length: 10}, (_, i) => [i + 1, 0]))

    const getById = async (id: number): Promise<Data[]> => {
        await wait(0)
        if(db.has(id)) return [{id, count: db.get(id)!}]
        return []
    }

    const getWithIdLess = async (n: number): Promise<Data[]> => {
        await wait(0)
        const ids = Array.from( db.keys() ).filter(id => id < n)
        return ids.map(id => ({id, count: db.get(id)!})) 
    }

    const insert = async (item: Data): Promise<void> => {
        await wait(0)
        if(db.has(item.id)) throw new Error('can not insert, item exists')
        db.set(item.id, item.count)
    }

    const update = async (item: Data): Promise<void> => {
        await wait(0)
        if(!db.has(item.id)) throw new Error('item does not exist')
        db.set(item.id, item.count)
    }

    const remove = async (item: Data): Promise<void> => {
        await wait(0)
        if(!db.has(item.id)) throw new Error('item was not found')
        db.delete(item.id)
    }

    return { getById, getWithIdLess, insert, update, remove }
}

// describe('getCache1', () => {
//     const getId = (user: DbUser) => user.id
//     const cache = getCache<DbUser>(getId)

//     const dbFns = {
//         getByUsernameDb: async (username: string) => await db('users').where({username}),
//         getWhereUsernameStartsWithDb: async (term: string) => await db('users').where('username', 'like', `${term}%`) as DbUser[],

//         create: async(item: DbUser) => await db('users').insert(item),
//         remove: async(item: DbUser) => await db('users').where({id: item.id}).del(),
//         update: async(item: DbUser) => await db('users').where({id: item.id}).update(item)
//     }

//     const cacheFns = {
//         getUsername: (username: string) => (user: DbUser) => user.username === username,
//         getWhereUsernameStartsWith: (term: string) => (user: DbUser) => user.username.startsWith(term)
//     }

//     const getByUsername = async (username: string) => {
//         const label = 'username=' + username
//         return cache.get(label, () => dbFns.getByUsernameDb(username))
//     }

//     const getWhereUsernameStartsWith = async (term: string) => {
//         const label='startswith=' + term
//         return cache.get(label, () => dbFns.getWhereUsernameStartsWithDb(term))
//     }

//     beforeAll(async() => {
//         await db.migrate.rollback()
//         await db.migrate.latest()
//         await db.seed.run()
//     })

//     afterEach(() => {
//         jest.clearAllMocks()
//     })

//     afterAll(async() => {
//         await db.migrate.rollback()
//     })

//     it('get all users', async () => {
//         const users: DbUser[] = await db('users').select('*')
//         expect(users.length > 0).toBeTruthy()
//     })

//     // get user1; get all labels; check count 
//     it('get user1', async () => {
//         const users = await getByUsername('user1')
//         expect(users).toBeDefined()
//         expect(users.length).toEqual(1)
//         expect(users[0].username).toEqual('user1')
//         expect(cache.count()).toEqual(1)
//     })

//     // get user2; get all labels; check count
//     it('get user2', async () => {
//         const users = await getByUsername('user2')
//         expect(users).toBeDefined()
//         expect(users.length).toEqual(1)
//         expect(users[0].username).toEqual('user2')
//         expect(cache.count()).toEqual(2)
//     })

//     // get all which starts with 'user'
//     it('get all starts with "user"', async () => {
//         const result = await getWhereUsernameStartsWith('user')
//         expect(result).toBeDefined()
//         expect(result.length).toEqual(4)
//         expect(cache.count()).toEqual(4)
//     })

//     it('get user1 again', async () => {
//         const getter = jest.spyOn(dbFns, 'getByUsernameDb')
//         const users = await getByUsername('user1')
//         expect(users).toBeDefined()
//         expect(users.length).toEqual(1)
//         expect(getter).not.toHaveBeenCalled()
//     })

//     it('getting user4; despite existing in cache, getter will called again', async () => {
//         const getter = jest.spyOn(dbFns, 'getByUsernameDb')
//         const users = await getByUsername('user4')
//         expect(users).toBeDefined()
//         expect(users.length).toEqual(1)
//         expect(getter).toHaveBeenCalled()
//     })

//     it('all labels so far', () => {
//         const expected = new Set([
//             'username=user1',
//             'username=user2',
//             'startswith=user'
//         ])

//         const actual = cache.getAllLabels()
//         for(const label of expected){
//             expect(actual.has(label)).toBeTruthy()
//         }
//     })

//     it('craete user5', async () => {
//         const user: DbUser = {
//             id: uuid(),
//             username: 'user5',
//             hashed: 'hashed password',
//             created: new Date(),
//         }

//         const getter = jest.spyOn(dbFns, 'getByUsernameDb')
//         cache.create(user, ['username=user5', 'startswith=user'])
//         expect(cache.count()).toEqual(5)

//         const extracted = await getByUsername('user5')
//         expect(extracted).toBeDefined()
//         expect(extracted.length).toEqual(1)
//         expect(getter).not.toHaveBeenCalled()

//         const extracted2 = await getWhereUsernameStartsWith('user')
//         expect(extracted2.length).toEqual(5)

//         expect(cache.count()).toEqual(5)
//         expect(cache.count('c')).toEqual(1)
//         expect(cache.count('u')).toEqual(0)
//         expect(cache.count('d')).toEqual(0)
//     })




//     it('sanity', () => expect(true).toBeTruthy())
// })