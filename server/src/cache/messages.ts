import db from "../config/db";
import { UserId, ChatId } from "shared/src/Types";
import { getCache } from "../cache1";
import messageModel from '../models/messages'
import { Message } from "../models/models";

const queries = {
    id: (id: string) => `id=${id}`,
    ofChat: (chatId: string) => `chat=${chatId}`,
    ofUser: (userId: string) => `for-user=${userId}` 
}

const cache = getCache<Message>(m => m.id)

const getMessageForChat = async (chatId: ChatId) => await cache.get(
    queries.ofChat(chatId),
    () => db('messages').where({chatId}).orderBy('timestamp', 'desc').select('*'),
    (m: Message) => new Set( [ queries.id(m.id) , queries.ofChat(m.chatId)] )
)

const getMessagesForUser = async (userId: UserId) => await cache.get(
    queries.ofUser(userId),
    // async () => await db('messages').whereIn('chatId', ids),
    async () => await db
        .with('chatIds', db('memberships').where({userId}).select('chatId as id'))
        .with('msgs', db('messages').whereIn('chatId', db('chatIds')))
        .select(['msgs.id', 'msgs.chatId', 'msgs.userId', 'msgs.timestamp', 'msgs.content']).from('msgs'),
    (m: Message) => new Set( [queries.ofUser(userId), queries.id(m.id), queries.ofChat(m.chatId)])
)

const insertMessage = async (message: Message) => await cache.insert(
    message,
    new Set( [ queries.id(message.id) , queries.ofChat(message.chatId), queries.ofUser(message.userId)] ),
    async (m: Message) => await db('messages').insert(m)
)

export function getMessageCache(){
    return {
        getMessageForChat,
        getMessagesForUser,
        insertMessage,
        cache
    }
}