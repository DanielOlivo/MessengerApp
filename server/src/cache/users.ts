import db from '../config/db'
import { Cache } from './cache';
import { UserId } from "shared/src/Types";
import { User } from "../models/models";
import userModel from '../models/users'
import { AsyncQueue } from 'utils/taskQueue';


export const queries = {
    id: (userId: UserId) => `id=${userId}`,
    asContact: (userId: UserId) => `contacts-id=${userId}`,
    username: (username: string) => `username=${username}`,
    asMember: (chatId: string) => `memberof=${chatId}`,
    search: (username: string) => `search=${username}`
}

export class UserCache extends Cache<User> {

    constructor(queue: AsyncQueue | undefined) {
        super(user => user.id, queue)
    }

    getUserById = async (id: UserId) => await this.get(
        queries.id(id),
        () => userModel.getById(id),
        (item: User) => [ queries.id(item.id) ]
    )

    getUsersAsContacts = async (id: UserId, ids: UserId[]) => await this.get(
        queries.asContact(id),
        () => userModel.getByIds(ids),
        (user: User) => [queries.id(user.id), queries.username(user.username), queries.asContact(id)]
    )

    getAsChatMembers = async (chatId: string) => await this.get(
        queries.asMember(chatId),
        async () => await userModel.getChatMembers(chatId),
        (u: User) => [queries.id(u.id), queries.username(u.username), queries.asMember(chatId)]
    )

    search = async (username: string) => await this.get(
        queries.username(username),
        async () => await userModel.searchByUsername(username),
        (user: User) => [queries.id(user.id), queries.username(user.username), queries.search(username)]
    )

    updateUser = async(user: User) => {
        this.update(user, userModel.update)
    }
}