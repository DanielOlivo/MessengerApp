import { UserId } from '@shared/Types';
import { User } from './models';
import db from '../config/db'

const model = {
    create: async(username: string, hashed: string, bio?: string): Promise<User> => {
        const [user]: User[] = await db('users')
            .insert({username, hashed, bio}, ['*'])
        return user;
    },

    remove: async(userId: UserId): Promise<UserId> => {
        const [{id}]: Partial<User>[] = await db('users').where('id', userId).del(['id'])
        return id as UserId
    },

    getAll: async(): Promise<User[]> => {
        const all: User[] = await db('users').select('*')
        return all
    },

    getByUsername: async(username: string): Promise<User[]> => {
        const user = await db('users').where({username}).select('*')
        return user
    },

    getById: async(id: UserId): Promise<User[]> => {
        const users = await db('users').where({id}).select('*')
        return users 
    },

    searchByUsername: async(username: string): Promise<User[]> => {
        const users = await db('users')
            .whereRaw('LOWER(username) LIKE LOWER( ? )', ["%".concat(username, '%')])
            .select('*')
        return users
    },
}

export default model