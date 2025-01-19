import { DbUser, UserId } from "../types/Types"
import db from '../config/db'

const model = {
    create: async(username: string, hashed: string, bio?: string) => {
        const [user]: DbUser[] = await db('users')
            .insert({username, hashed, bio}, 
            //    ['id', 'bio', 'username', 'hashed', 'created'] 
                ['*']
            )
            return user;
    },

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
    }

}

export default model