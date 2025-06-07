import dayjs from 'dayjs'
import { AsyncQueue } from 'utils/taskQueue'

type Tag = string
type ID = string | number

export class Cache<T> {

    getIdFn: (item: T) => ID
    items: Map<ID, T>
    tagIds: Map<Tag, Set<ID>>
    idTags: Map<ID, Set<Tag>>
    requests: Map<Tag, number>
    queue: AsyncQueue | undefined

    constructor(getIdFn: (item: T) => ID, queue: AsyncQueue | undefined){
        this.getIdFn = getIdFn
        this.items = new Map()
        this.tagIds = new Map()
        this.idTags = new Map() 
        this.requests = new Map()
        this.queue = queue
    }

    async get(
        tag: Tag,
        extractFn: () => Promise<T[]>,
        createTagFn: (item: T) => Tag[]
    ){
        this.requests.set(tag, this.now())
        if( this.tagIds.has(tag) ){
            return Array.from( this.tagIds.get(tag)! ).map(id => this.items.get(id)!)
        }
        
        const extracted = 
            this.queue 
            ? await this.queue.enqueue(async () => extractFn()) 
            : await extractFn()

        const result: T[] = []

        for(const item of extracted){
            const id = this.getIdFn(item)
            const tags = createTagFn(item)

            if(this.items.has(id)){
                result.push(this.items.get(id)!)
            }  
            else {
                this.items.set(id, item)
                result.push(item)
            }

            const currentTags = this.getIdTagsOrDefault(id)
            tags.forEach(tag => currentTags.add(tag))
            // this.idTags.set(id, new Set([...currentTags, ...tags]))
            
            for(const tag of tags){
                const ids = this.getTagIdsOrDefault(tag)
                ids.add(id)
            }
        }

        return result
    }

    insert(
        item: T,
        tags: Tag[],
        insertFn: (i: T) => Promise<void>
    ): void {
        const fn = () => {
            const id = this.getIdFn(item)
            this.items.set(id, item)
            tags.forEach(tag => this.getTagIdsOrDefault(tag).add(id))
            this.idTags.set(id, new Set(tags))
        }

        if(this.queue){
            this.queue.enqueue(async () => Promise.resolve(fn()))
            // fn()
            this.queue.enqueue(async () => await insertFn(item))
        }
        else {
            fn()
            insertFn(item) 
        }
    }

    update(
        item: T,
        updateFn: (item: T) => Promise<void>
    ) {
        const id = this.getIdFn(item)
        const tags = this.idTags.get(id)! 
        this.items.set(id, item)
        tags.forEach(tag => this.requests.set(tag, this.now()))

        if(this.queue){
            this.queue.enqueue(async () => await updateFn(item))
        }
        else {
            updateFn(item)
        }
    }


    remove(
        item: T,
        removeFn: (item: T) => Promise<void>
    ) {
        const id = this.getIdFn(item)
        this.items.delete(id) 
        const tags = this.idTags.get(id)!
        this.idTags.delete(id)

        for(const tag of tags){
            const ids = this.tagIds.get(tag)!
            if(ids.size === 1){
                this.tagIds.delete(tag)
            }
            else {
                ids.delete(id)
            }
        }
        if(this.queue){
            this.queue.enqueue(async () => await removeFn(item))
        }
        else {
            removeFn(item)
        }
    }

    removeById(
        id: ID,
        removeFn: (id: ID) => Promise<void>
    ) {
        this.items.delete(id) 
        const tags = this.idTags.get(id)!
        this.idTags.delete(id)

        for(const tag of tags){
            const ids = this.tagIds.get(tag)!
            if(ids.size === 1){
                this.tagIds.delete(tag)
            }
            else {
                ids.delete(id)
            }
        }
        if(this.queue){
            this.queue.enqueue(async () => await removeFn(id))
        }
        else {
            removeFn(id)
        }
    }

    reset(){
        this.items.clear()
        this.tagIds.clear()
        this.idTags.clear()
        this.requests.clear()
    }

    now(){ return dayjs().valueOf() }

    getAllTags(){ return this.tagIds.keys() }
    getAllIds(){ return this.idTags.keys() }

    getTagIdsOrDefault(tag: Tag): Set<ID> {
        if( this.tagIds.has(tag) ) return this.tagIds.get(tag)!
        const s = new Set<ID>()
        this.tagIds.set(tag, s)
        return s
    }

    getIdTagsOrDefault(id: ID): Set<Tag>{
        if( this.idTags.has(id) ) return this.idTags.get(id)!
        const s = new Set<Tag>()
        this.idTags.set(id, s)
        return s
    }

}

export function getCache<T extends object>(getIdFn: (item: T) => ID){

    const now = () => dayjs().valueOf()
    const map = new Map<ID, T>() 
    const tagIds = new Map<Tag, Set<ID>>()
    const idTags = new Map<ID, Set<Tag>>()

    const getIdTagsOrDefault = (id: ID): Set<string> => {
        if(idTags.has(id)) return idTags.get(id)!
        const s = new Set<string>()
        idTags.set(id, s)
        return s
    }

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

        if(tag && tagIds.has(tag)){
            requests.set(tag, now())
            return Array.from( tagIds.get(tag)! )
                .map(id => map.get(id)!)
        }

        const extracted = await extractFn()
        const result: T[] = []
        for(const item of extracted){
            const id = getIdFn(item)
            const tags = createTagFn(item)

            // if(!idTags.has(id)){
            //     idTags.set(id, new Set())
            // }
            // const existingTags = idTags.get(id) 
            const existingTags = getIdTagsOrDefault(id)

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
