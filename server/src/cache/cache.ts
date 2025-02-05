import db from '@config/db'
import { Chat, DbUser, Message, UserId } from "@shared/Types"

type User = {
    id: string
    username: string
    age: number
}
let user: User = { id: '1234', username: 'john.doe', age: 20}
const tableName = 'users'
// console.log('user', user)

type Getter<T> = { get(): T }
type Setter<T> = { set(a: T): void }
type Prop<T> = (Getter<T> & Setter<T>)

type Getters<T> = { [K in keyof T]: Getter<T[K]> }
type Props<T> = { [K in keyof T]: Prop<T[K]> }

type Plainer<T> = {
    getPlain(): T
}

export type Status = 'none' | 'create' | 'update' | 'delete'
type HasStatus = {
    getStatus(): Status
    setStatus(st: Status): void
}

type Pushable = {
    push(trx: any): Promise<void>
}

function splitObject<T extends object, K extends keyof T>(obj: T, keys: K[]): [Pick<T,K>, Omit<T,K>] {
    const picked = {} as Pick<T, K>;
    const omitted = {} as Omit<T, K>;

    for (const key of Object.keys(obj) as Array<keyof T>) {
        if (keys.includes(key as K)) {
            picked[key as K] = obj[key as K];
        } else {
            omitted[key as Exclude<keyof T, K>] = obj[key as Exclude<keyof T, K>];
        }
    }

    return [picked, omitted];
}


// const [incl, excl] = splitObject<User, 'id'>(user, ['id'])
// console.log('incl', incl, 'excl', excl)

function getGetters<T extends object>(o: T, requestedFn: () => void): Getters<T> & Plainer<T>{
    const result = {} as { [K in keyof T]: Getter<T[K]>}
    for(const key in o){
        result[key] = { get: () => {
            requestedFn()
            return o[key]
        }}
    }
    const getPlain = () => o
    return {...result, getPlain}
}

function getProps<T extends object>(o: T, requestedFn: () => void, initStatus: Status = 'none'): Props<T> & HasStatus & Plainer<T>{
    const result = {} as { [K in keyof T]: Prop<T[K]>}
    let status: Status = initStatus

    for(const key in o){
        let raw = o[key]
        result[key] = { 
            get: () => raw,
            set: (a: T[Extract<keyof T, string>]) => {
                raw = a
                if(status === 'none'){
                    status = 'update'
                }
                requestedFn()
            }
        }
    }

    const getPlain = () => {
        const plained = {} as {[K in keyof T]: T[K]}
        for(let key in result){
            plained[key] = result[key].get()
        }
        return plained
    } 


    const hasStatusInstance: HasStatus = {
        getStatus: () => status,
        setStatus: (st: Status) => status = st
    }

    return {...result, ...hasStatusInstance, getPlain}
}


async function push<T extends object>(o: T, byKey: Partial<T>, trx: any, status: Status){
    if(status == 'create'){
        await db('users').insert(o).transacting(trx)
        return
    } 
    await db('users').where(byKey).update(o).transacting(trx)
    return
}

// const {getPlain: getPlain1, ...getters} = getGetters(incl)
// const {getPlain: getPlain2, ...props} = getProps(excl)

function getPush<T extends object>(tableName: string, hasStatus: HasStatus, getPlain: () => T, getKey: (a: T) => Partial<T>){
    return async function push(trx: any){
        const status = hasStatus.getStatus()
        const plained = getPlain()
        if(status == 'create'){
            await db(tableName).insert(plained).transacting(trx)
            hasStatus.setStatus('none')
            return 
        }          
        else if(status == 'update'){
            const key = getKey(plained)
            hasStatus.setStatus('none')
            await db(tableName).where(key).update(plained)
        }
        else if(status == 'delete'){
            const key = getKey(plained)
            await db(tableName).where(key).del()
        }
    }
}

export type Cached<T extends object, K extends keyof T> = 
    HasStatus & Pushable & Plainer<T>
    & Getters<Pick<T,K>> & Props<Omit<T, K>>

export function create<T extends object, K extends keyof T>(obj: T, readOnlyFields: K[], tableName: string, getKey: (a: T) => Partial<T>){
    const [toRead, toReadWrite] = splitObject(obj, readOnlyFields)

    let requestedTime = new Date()
    const getRequestedTime = () => requestedTime
    const updateRequestedTime = () => requestedTime = new Date()

    const {getPlain: getPlain1, ..._getters} = getGetters(toRead, updateRequestedTime) 
    const {getPlain: getPlain2, getStatus, setStatus,  ..._props} = getProps(toReadWrite, updateRequestedTime, 'create')

    const getters: Getters<Pick<T,K>> = _getters as any
    const props: Props<Omit<T,K>> = _props as any

    const getPlain = ():T => {
        const result1 = getPlain1()
        const result2 = getPlain2()
        return {...result1, ...result2} as T
    }

    const plainer: Plainer<T> = { getPlain }

    const hasStatus: HasStatus = {getStatus, setStatus}

    const push = getPush(tableName, hasStatus, getPlain, getKey)
    const result: Cached<T,K> = {push, ...hasStatus, ...plainer, ...getters, ...props}
    return result
}

export async function load<T extends object, K extends keyof T>(key: Partial<T>, readOnlyFields: K[], tableName: string, getKey: (a: T) => Partial<T>){
    const fields = await db(tableName).where(key).first() as T
    const proxy = create(fields, readOnlyFields, tableName, getKey)
    proxy.setStatus('none')
    return proxy
}


export type Cache<T extends object, K extends keyof T> = {
    items: {K: Cached<T,K>} 
    expirationTime: Date
    add(a: Cached<T,K>): void
}

export function getCache<T extends object, K extends keyof T>(expTime: Date, getKeyFn: (a: Cached<T,K>) => Extract<T[K], string | number | symbol>): Cache<T,K>{

    const items = {} as { [Key in Extract<T[K], string | number | symbol >]: Cached<T,K>}
     
    const add = (cached: Cached<T,K>) => {
        const key: Extract<T[K], string | number | symbol > = getKeyFn(cached)
        items[key] = cached
    }

    const cache: Cache<T,K> = {
        expirationTime: expTime,
        items: {} as {K: Cached<T,K>},
        add
    }
    return cache
}


type CachedChat = {
    users: { string : Cached<DbUser,'id' | 'username' | 'created'> }
    chat: Cached<Chat, 'id'>
    messages: Cached<Message, 'id' | 'created' | 'chatId' | 'userId'>[]
}

type Environment = {
    chats: { string: CachedChat }
    loadContext(userId: UserId): void
}

function getEnvironment(): Environment {

     

    throw new Error()
}