import db from "../config/db";
import { UserId, ChatId } from "shared/src/Types";
import { getCache } from "../cache1";
import infoModel from '../models/chatInfo'
import { ChatInfo } from "../models/models";

const queries = {
    id: (id: string) => `id=${id}`,
    ofChat: (chatId: ChatId) => `ofchat=${chatId}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`
}

const cache = getCache<ChatInfo>(i => i.id)

const getChatInfoOfUser = async (userId: UserId, ids: ChatId[]) => await cache.get(
    queries.ofUser(userId),
    () => infoModel.getByChatIds(ids),
    (i: ChatInfo) => new Set( [queries.id(i.id), queries.ofUser(userId)] )
)

const getChatInfo = async (chatId: ChatId) => await cache.get(
    queries.ofChat(chatId),
    () => db('chatinfo').where({chatId}).select('*'),
    (info: ChatInfo) => new Set( [queries.id(info.id), queries.ofChat(info.chatId)] )
)

const insert = (info: ChatInfo) => cache.insert(
    info,
    new Set( [ queries.id(info.id) ] ),
    (i) => db('chatinfo').insert(i)
)

export function getChatInfoCache(){
    return {
        getChatInfoOfUser,
        getChatInfo,
        insert,
        cache
    }
}