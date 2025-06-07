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

    update: async(user: User): Promise<void> => {
        const { hash, iconSrc } = user
        await db('users').where({id: user.id}).update({hash, iconSrc})
    },

    updatePassword: async(id: UserId, newHash: string): Promise<void> => {
        await db('users').where({id}).update({hash: newHash})
        return
    },

    updateIcon: async(id: UserId, newIconSrc: string): Promise<void> => {
        await db('users').where({id}).update({iconSrc: newIconSrc})
        return
    },

    getAll: async(): Promise<User[]> => {
        const all: User[] = await db('users').select('*')
        return all
    },

    getChatMembers: async(chatId: string) => 
        await db('memberships')
            .join('users', 'users.id', '=', 'memberships.userId')
            .where('memberships.chatId', '=', chatId)
            .select('users.*'),

    getByUsername: async(username: string): Promise<User[]> => {
        const user = await db('users').where({username}).select('*')
        return user
    },

    getById: async(id: UserId): Promise<User[]> => {
        const users = await db('users').where({id}).select('*')
        return users 
    },

    getByIds: async (ids: UserId[]): Promise<User[]> => {
        const users = await db('users').whereIn('id', ids).select('*')
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