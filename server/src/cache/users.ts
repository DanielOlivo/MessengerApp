import { getCache } from "../cache1";
import { UserId } from "shared/src/Types";
import { User } from "../models/models";
import userModel from '../models/users'


const cache = getCache<User>(u => u.id)

const getUserById = async (id: UserId) => await cache.get(
    'id=' + id,
    () => userModel.getById(id),
    () => new Set( `id=${id}` )
)

const getUsersAsContacts = async (id: UserId, ids: UserId[]) => await cache.get(
    'contacts-id=' + id,
    () => userModel.getByIds(ids),
    (user: User) => new Set( [`id=${user.id}`, `contacts-id=${id}`] )
)


export default {
    getUserById,
    getUsersAsContacts
}