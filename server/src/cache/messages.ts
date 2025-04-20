import db from "../config/db";
import { UserId, ChatId } from "shared/src/Types";
import { getCache } from "../cache1";
import messageModel from '../models/messages'
import { Message } from "../models/models";

const cache = getCache<Message>(m => m.id)

const getMessageForChat = async (chatId: ChatId) => await cache.get(
    'chat=' + chatId,
    () => db('messages').where({chatId}).orderBy('timestamp', 'desc').select('*'),
    (m: Message) => new Set( [`id=${m.id}`, `chat=${m.chatId}`] )
)

const getMessagesForUser = async (userId: UserId, ids: ChatId[]) => await cache.get(
    'for-user=' + userId,
    () => messageModel.getByChatIds(ids),
    (m: Message) => new Set( [`for-user=${userId}`, `id=${m.id}`, `chat=${m.chatId}`])
)

const insertMessage = (message: Message) => cache.insert(
    message,
    new Set( [`id=${message.id}`, `chat=${message.chatId}`] ),
    (m: Message) => db('messages').insert(m)
)

export function getMessageCache(){
    return {
        getMessageForChat,
        getMessagesForUser,
        insertMessage,
        cache
    }
}