import dayjs from 'dayjs'

type Tag = string
type ID = string

export function getCache<T extends object>(getIdFn: (item: T) => ID){

    const now = () => dayjs().valueOf()
    const map = new Map<ID, T>() 
    const tagIds = new Map<Tag, Set<ID>>()
    const idTags = new Map<ID, Set<Tag>>()

    const requests = new Map<Tag, number>()

    const getAllTags = () => new Set( tagIds.keys() )
    const getReqTimestamp = (tag: Tag) => requests.get(tag)
    const getLifeTime = (id: ID) => { 
        const n = now()
        const accessTimestamps = Array.from( idTags.get(id)! ).map(tag => n - requests.get(tag)!)
        const min = accessTimestamps.reduce((m, i) => i < m ? i : m, accessTimestamps[0])
        return min
    }

    const count = () => map.size

    const get = async (
        tag: Tag | null,                        // tag associated with item id
        extractFn: () => Promise<T[]>,          // called in case of absense in cache
        createTagFn: (item: T) => Set<Tag>      // called in case of absense in cache
    ): Promise<T[]> => {

        if(tag !== null && tagIds.has(tag)){
            requests.set(tag, now())
            return Array.from( tagIds.get(tag)! )
                .map(id => map.get(id)!)
        }

        const extracted = await extractFn()
        const result: T[] = []
        for(const item of extracted){
            const id = getIdFn(item)
            const tags = createTagFn(item)

            if(!idTags.has(id)){
                idTags.set(id, new Set())
            }
            const existingTags = idTags.get(id) 
            tags.forEach(t => existingTags?.add(t))
            
            for(const tag of tags){
                if(!tagIds.has(tag)){
                    tagIds.set(tag, new Set())
                }
                tagIds.get(tag)!.add(id)
            }

            if(!map.has(id)){
                map.set(id, item)
            }
            result.push(map.get(id)!)
        }

        return result
    }

    const insert = async (item: T, tags: Set<Tag>, insertFn: (i: T) => Promise<void>) => {
        const id = getIdFn(item)
        map.set(id, item)
        idTags.set(id, tags)

        for(const tag of tags){
            if(!tagIds.has(tag)){
                tagIds.set(tag, new Set())
            }
            tagIds.get(tag)!.add(id)
        }
        await insertFn(item)
    }

    const remove = async (item: T, fn: (i: T) => Promise<void>) => {
        const id = getIdFn(item)
        const tags = idTags.get(id)!
        idTags.delete(id)
        for(const tag of tags){
            const ids = tagIds.get(tag)!
            if(ids.size === 1){
                tagIds.delete(tag)
                requests.delete(tag)
            }
            else {
                ids.delete(id)
            }
        }
        map.delete(id)
        await fn(item)
    }

    const update = (item: T, tags: Set<Tag>, updateFn: (i: T) => Promise<void>) => {
        throw new Error()
    }

    const removeById = (id: ID, removeFn: (id: ID) => Promise<void>) => {
        map.delete(id)
        const tags = idTags.get(id)!
        idTags.delete(id) 
        for(const tag of tags){
            tagIds.get(tag)?.delete(id)
        }
        removeFn(id)
    }

    return { get, getAllTags, getReqTimestamp, getLifeTime, insert, update, remove, removeById, count }
}
