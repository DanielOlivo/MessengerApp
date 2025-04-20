import db from "../config/db";
import { Chat } from "../models/models";
import { getCache } from "../cache1";
import { ChatId, UserId } from "shared/src/Types";
import chatModel from '../models/chats'

const cache = getCache<Chat>(c => c.id)

const getUserChats = async (userId: UserId, ids: ChatId[]) => await cache.get(
    'user=' + userId,
    () => chatModel.getByIds(ids),
    (chat: Chat) => new Set( [`user=${userId}`, `id=${chat.id}`] )
)

const getChats = async (ids: ChatId[]) => await cache.get(
    null,
    () => db('chats').whereIn('id', ids).select('*'),
    (chat: Chat) => new Set( [`id=${chat.id}`] )
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
        getChats,
        insert,
        remove,
        cache
    }
}