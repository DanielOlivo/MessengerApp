import { describe, it, expect } from "@jest/globals";
import { getTrackedMap } from "./state";

describe('TrackedMap', () => {
    
    interface SomeType {
        id: number
        data: string
    }

    const getterFn1 = async (key: number) => key == 1 ? { id: 1, data: 'data'} : undefined

    it('has: true', async () => {
        const map = getTrackedMap<number, SomeType>(getterFn1)
        const result = await map.has(1)
        expect(result).toBeTruthy()
    }) 

    it('has: false', async () => {
        const map = getTrackedMap<number, SomeType>(getterFn1)
        const result = await map.has(2)
        expect(result).toBeFalsy()
    })

    it('get: existing value', async () => {
        const map = getTrackedMap<number, SomeType>(getterFn1)
        const { id, data } = await map.get(1)
        expect(id).toEqual(1)
        expect(data).toEqual('data')
    })

    it('get: nonexisting value', async () => {
        const map = getTrackedMap<number, SomeType>(getterFn1)
        expect(map.get(2)).rejects.toThrow()
    })

    it('create', async () => {
        const map = getTrackedMap<number, SomeType>(getterFn1)
        const item: SomeType = { id: 3, data: 'something'}
        map.create(item.id, item)
        expect(map.get(3)).resolves.toBeTruthy()
        expect(map.getStatus(3)).toEqual('created')
    })

    it('update', async () => {
        const map = getTrackedMap<number, SomeType>(getterFn1)
        await map.update(1, ({id, }) => {
            return {id, data: 'i was updated'} 
        })
        const { data } = await map.get(1)
        expect(data).toEqual('i was updated')
        expect(map.getStatus(1)).toEqual('updated')
    }) 

    it('remove', async () => {
        const map = getTrackedMap<number, SomeType>(getterFn1)
        map.remove(1) 
        expect(map.has(1)).resolves.toEqual(false)
    }) 



     

})