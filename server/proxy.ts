process.env.NODE_ENV = 'test'
import 'tsconfig-paths/register'

import {v4 as uuid} from 'uuid'
// import db from './config/db'
import config from './knexfile'
import knex, {Knex} from 'knex'
import {DbUser} from '@shared/Types'

// console.log(config['test'])

// const db = knex(config['test'] as Knex.Config)
const db = knex({
    client: 'pg',
    connection: {
      port: 5432,
      user: 'daniel',
      password: '1234',
      database: 'messenger_test'
    },
})
// console.log(db)

type ReadProp<T> = {
    get(): T 
}

type Prop<T> = {
    get(): T
    set(value: T): void
}

type ReadProps<T> = {
    [K in keyof T]: ReadProp<T[K]>
}


type Props<T> = {
    [K in keyof T]: Prop<T[K]>
}

type Status = 'none' | 'create' | 'update' | 'delete'

type HasStatus = {
    getStatus(): Status
    setStatus(status: Status): void
}

type Immutable<T, K extends keyof T> = ReadProps<Pick<T, K>>
type Mutable<T,K extends keyof T> = Props<Omit<T, K>>

type Proxied<T,K extends keyof T> = Immutable<T,K> & Mutable<T,K> & HasStatus

type Cache<T, K extends keyof T, U extends keyof T> = {
    proxies: Proxied<T,K>[]
    create(data: T): void
    // load(key: U, value: T[U]): Promise<Proxied<T,K>>
    // load(key: {U: T[U]}): Promise<Proxied<T,K>>
    load(key: Partial<T>): Promise<Proxied<T,K>>
    push():void
}


function getReadProps<T extends object>(o: T): ReadProps<T> {
    const result = {} as ReadProps<T> 
    for(let key in o){
        result[key] = {
            get: () => o[key]
        }
    }
    return result
}

function getProps<T extends object>(o: T): Props<T> & HasStatus {
    const result = {} as Props<T> 
    let status: Status = 'none'    

    for(let key in o){
        let rawValue = o[key]
        result[key] = {
            get: () => rawValue,
            set: (value) => {
                rawValue = value
                switch(status){
                    case 'none': status = 'update';
                    default: {}
                }
            },
        }
    }

    const getStatus = () => status
    const setStatus = (st: Status) => status = st
    return {...result, getStatus, setStatus}
}


function getCached<T extends object, K extends keyof T>(o: T): Proxied<T,K> {
    const part1 = getReadProps<Pick<T,K>>(o)
    const part2 = getProps<Omit<T, K>>(o)
    return {...part1, ...part2}
}


function getCache<T extends object,K extends keyof T, U extends keyof T>(tableName: string): Cache<T,K,U> {
    const proxies: Proxied<T,K>[] = [] 

    const create = (data: T) => {
        const cached = getCached<T,K>(data)
        cached.setStatus('create')
        proxies.push(cached)
    }

    // const load = async (key: {U: T[U]}): Promise<Proxied<T,K>> => {
    const load = async (key: Partial<T>): Promise<Proxied<T,K>> => {
        console.log('load', key)
        const fields = await db(tableName).where(key).select('*').first() as T
        const cached = getCached<T,K>(fields)
        proxies.push(cached)
        return cached
    }
    
    const push = () => {
        const op = db.transaction(async trx => {
            for(const pr of proxies){
                const status = pr.getStatus()
                
            }
        })
        // todo
    }

    return {
        proxies,
        create,
        load,
        push
    }
}


async function test(){
    const userCache = getCache<DbUser, 'id' | 'created' | 'username', 'id'>('users')

    const {id} = await db('users').where({username: 'user1'}).select('id').first()
    console.log(id)
    // console.log(userCache.proxies.length)
    const criteria = {id}
    console.log(criteria)

    const user1 = await userCache.load(criteria)
    console.log(user1)

    console.log(userCache.proxies.length)
    console.log(user1.getStatus())
    user1.hashed.set('new hashed')
    console.log(user1.getStatus())
    
    

}

test()

// const userCache = getCache<DbUser, 'id' | 'created', 'id'>('users')
// let _user1: DbUser = {id: uuid(), username: 'user1', hashed: 'hashed', created: new Date()}

// userCache.create(_user1)

// console.log(userCache.proxies[0])

// let user: Proxied<DbUser, 'id' | 'created'> = getCached<DbUser, 'id' | 'created'>(_user1)




// console.log(user.id.get())

// console.log(user.username.get())
// console.log(user.getStatus())

// user.username.set('user1000')
// console.log(user.getStatus())
