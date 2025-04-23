import db from '../config/db'
import { getCache } from "../cache1";
import { UserId } from "shared/src/Types";
import { User } from "../models/models";
import userModel from '../models/users'


const cache = getCache<User>(u => u.id)

export const queries = {
    id: (userId: UserId) => `id=${userId}`,
    asContact: (userId: UserId) => `contacts-id=${userId}`,
    username: (username: string) => `username=${username}`
}

const getUserById = async (id: UserId) => await cache.get(
    queries.id(id),
    () => userModel.getById(id),
    () => new Set( queries.id(id) )
)

const getUsersAsContacts = async (id: UserId, ids: UserId[]) => await cache.get(
    queries.asContact(id),
    () => userModel.getByIds(ids),
    (user: User) => new Set( [queries.id(user.id), queries.asContact(id)] )
)

const search = async (username: string) => await cache.get(
    queries.username(username),
    () => db('users').where({username}).select('*'),
    (user: User) => new Set( [queries.id(user.id), queries.username(user.username)] )
)

export function getUserCache(){
    return {
        getUserById,
        getUsersAsContacts,
        search,
        cache
    }
}