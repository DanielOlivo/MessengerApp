import db from "../config/db";
import { UserId, ChatId } from "shared/src/Types";
import { getCache } from "./cache";
import infoModel from '../models/chatInfo'
import { ChatInfo } from "../models/models";

const queries = {
    id: (id: string) => `id=${id}`,
    ofChat: (chatId: ChatId) => `ofchat=${chatId}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`
}

const cache = getCache<ChatInfo>(i => i.id)

const getChatInfoOfUser = async (userId: UserId) => await cache.get(
    queries.ofUser(userId),
    // () => infoModel.getByChatIds(ids),
    async () => await db 
        .with('m', db('memberships').where({userId}).select('chatId as id'))
        .select(['ci.id', 'ci.chatId', 'ci.name', 'ci.iconSrc']).from('chatinfo as ci').whereIn('chatId', db('m')),
    (i: ChatInfo) => new Set( [queries.id(i.id), queries.ofUser(userId)] )
)

const getChatInfo = async (chatId: ChatId) => await cache.get(
    queries.ofChat(chatId),
    () => db('chatinfo').where({chatId}).select('*'),
    (info: ChatInfo) => new Set( [queries.id(info.id), queries.ofChat(info.chatId)] )
)

const insert = async (info: ChatInfo) => await cache.insert(
    info,
    new Set( [ queries.id(info.id) ] ),
    async (i) => await db('chatinfo').insert(i)
)

export function getChatInfoCache(){
    return {
        getChatInfoOfUser,
        getChatInfo,
        insert,
        cache
    }
}