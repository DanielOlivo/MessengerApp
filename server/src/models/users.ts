import { DbUser, UserId } from '@shared/Types';
import db from '../config/db'
import {v4 as uuid4} from 'uuid'

const model = {
    create: async(username: string, hashed: string, bio?: string) => {
        const [user]: DbUser[] = await db('users')
            .insert({username, hashed, bio}, 
            //    ['id', 'bio', 'username', 'hashed', 'created'] 
                ['*']
            )
            return user;
    },

    // create: async(username: string, hashed: string, bio?:string) =>{
    //     const result: unknown = await db.transaction(async trx => {
    //         return trx('users').insert({username, hashed, bio}).returning('*')
    //     })
    //     const [user] = result as DbUser[]
    //     return user
    // },

    remove: async(userId: UserId) => {
        const [{id}]: Partial<DbUser>[] = await db('users')
            .where('id', userId)
            .del(['id'])
        return id as UserId
    },

    getAll: async() => {
        const all: DbUser[] = await db('users').select('*')
        return all
    },

    getByUsername: async(username: string) => {
        const user = await db('users').where({username}).first() as DbUser
        return user
    },

    getById: async(userId: UserId) => {
        const user = await db('users')
            .where('id', userId)
            .select('*')
            .first() as DbUser
        return user 
    },

    searchByUsername: async(username: string) => {
        const users = await db('users')
            .whereRaw('LOWER(username) LIKE LOWER( ? )', ["%".concat(username, '%')])
            .select('*') as DbUser[]
        return users
    },

    handleSearchBy: async(id: UserId, criteria: string) => {
        const result = await db('users')
            .whereRaw("LOWER(username) LIKE LOWER(?)", ['%' + criteria.toLowerCase() + '%'])
            .andWhereNot({id})
            .select('id', 'username', 'created', 'bio', ) as Omit<DbUser, 'hashed'>[]
        return result
    }

}

export default model


// export type {UserModel}