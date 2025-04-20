import { UserId, ChatId } from "shared/src/Types";
import { getCache } from "../cache1";
import messageModel from '../models/messages'
import { Message } from "../models/models";

const cache = getCache<Message>(m => m.id)

const getMessagesForUser = async (userId: UserId, ids: ChatId[]) => await cache.get(
    'for-user=' + userId,
    () => messageModel.getByChatIds(ids),
    (m: Message) => new Set( [`for-user=${userId}`, `id=${m.id}`, `chat=${m.chatId}`])
)

export default {
    getMessagesForUser
}