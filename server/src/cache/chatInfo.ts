import db from "../config/db";
import { UserId, ChatId } from "shared/src/Types";
import { getCache } from "../cache1";
import infoModel from '../models/chatInfo'
import { ChatInfo } from "../models/models";

const cache = getCache<ChatInfo>(i => i.id)

const getChatInfoOfUser = async (userId: UserId, ids: ChatId[]) => await cache.get(
    'user=' + userId,
    () => infoModel.getByChatIds(ids),
    (i: ChatInfo) => new Set( [`id=${i.id}`, `user=${userId}`] )
)

const getChatInfo = async (chatId: ChatId) => await cache.get(
    `chat=${chatId}`,
    () => db('chatinfo').where({chatId}).select('*'),
    (info: ChatInfo) => new Set( [`id=${info.id}`, `chat=${info.chatId}`] )
)

export default {
    getChatInfoOfUser,
    getChatInfo
}