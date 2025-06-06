import db from "../config/db";
import { Chat } from "../models/models";
import { Cache } from "./cache";
import { ChatId, UserId } from "shared/src/Types";
import chatModel from '../models/chats'

export const queries = {
    id: (id: ChatId) => `id=${id}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`,
    between: (id1: UserId, id2: UserId) => `between=${id1}&${id2}`
}

export class ChatCache extends Cache<Chat> {

    constructor(fn: (user: Chat) => string) {
        super(fn)
    }

    getUserChats = async (userId: UserId, ids: ChatId[]) => await this.get(
        queries.ofUser(userId),
        async () => await chatModel.getByIds(ids),
        (chat: Chat) => [queries.ofUser(userId), queries.id(chat.id)]
    )

    getChatById = async (id: ChatId) => await this.get(
        queries.id(id),
        async () => await chatModel.getById(id),
        (chat: Chat) => [queries.id(chat.id)]
    )

    getChatsOfUser = async(userId: UserId, ids: ChatId[]) => await this.get(
        queries.ofUser(userId),
        async () => await chatModel.getByIds(ids),
        (chat: Chat) => [ queries.id(chat.id), queries.ofUser(userId)]
    )

    getDmBetween = async(id1: UserId, id2: UserId) => await this.get(
        queries.between(id1, id2),
        async () => await chatModel.getDmBetween(id1, id2),
        (chat: Chat) => [ 
            queries.between(id1, id2), 
            queries.between(id2, id1), 
            queries.id(chat.id) 
        ] 
    )

    insertChat = async (chat: Chat) => this.insert(
        chat,
        [ queries.id(chat.id) ],
        chatModel.create
    )

    removeChat = (chatId: ChatId) => this.removeById(
        chatId,
        async() => chatModel.remove(chatId)
    )
}