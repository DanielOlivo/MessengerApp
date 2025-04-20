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

export default {
    getChatInfoOfUser
}