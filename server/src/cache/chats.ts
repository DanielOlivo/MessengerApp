import db from "../config/db";
import { Chat } from "../models/models";
import { getCache } from "../cache1";
import { ChatId, UserId } from "shared/src/Types";
import chatModel from '../models/chats'

export const queries = {
    id: (id: ChatId) => `id=${id}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`,
    between: (id1: UserId, id2: UserId) => `between=${id1}&${id2}`
}

const cache = getCache<Chat>(c => c.id)

const getUserChats = async (userId: UserId, ids: ChatId[]) => await cache.get(
    queries.ofUser(userId),
    () => chatModel.getByIds(ids),
    (chat: Chat) => new Set( [queries.ofUser(userId), queries.id(chat.id)] )
)

const getChats = async (ids: ChatId[]) => await cache.get(
    null,
    () => db('chats').whereIn('id', ids).select('*'),
    (chat: Chat) => new Set( [ queries.id(chat.id) ] )
)

const getChatsOfUser = async(userId: UserId, ids: ChatId[]) => await cache.get(
    queries.ofUser(userId),
    () => db('chats').whereIn('id', ids).select('*'),
    (chat: Chat) => new Set( [ queries.id(chat.id), queries.ofUser(userId)])
)

const getDmBetween = async(id1: UserId, id2: UserId) => await cache.get(
    queries.between(id1, id2),
    async () => await db
        .with('user1m', db('memberships').where({userId: id1}))
        .with('user2m', db('memberships').where({userId: id2}))
        .with('joined',
            db('user1m')
            .innerJoin('user2m', 'user1m.chatId', '=', 'user2m.chatId')
            .select('user1m.chatId as id')
        )
        .select('chats.*').from('joined')
        .join('chats', 'chats.id', '=', 'joined.id')
        .where('isGroup', false),
    (chat: Chat) => new Set( [ queries.between(id1, id2), queries.id(chat.id) ] )
)

const insert = (chat: Chat) => cache.insert(
    chat,
    new Set( [`id=${chat.id}`] ),
    (c: Chat) => db('chats').insert(c)
)

const remove = (chatId: ChatId) => cache.removeById(
    chatId,
    (id) => db('chats').where({id}).del()
)

export function  getChatCache(){
    return {
        getUserChats,
        getChats, getChatsOfUser,
        getDmBetween,
        insert,
        remove,
        cache
    }
}