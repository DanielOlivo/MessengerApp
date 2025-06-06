process.env.NODE_ENV = 'test'

import { describe, it, expect, beforeAll, jest, beforeEach } from "@jest/globals";
import { Cache } from "./cache";
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