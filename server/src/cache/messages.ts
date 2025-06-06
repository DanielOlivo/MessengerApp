import db from "../config/db";
import { UserId, ChatId } from "shared/src/Types";
import { Cache, getCache } from "./cache";
import messageModel from '../models/messages'
import { Message } from "../models/models";

const queries = {
    id: (id: string) => `id=${id}`,
    ofChat: (chatId: string) => `chat=${chatId}`,
    ofUser: (userId: string) => `for-user=${userId}` 
}

export class MessageCache extends Cache<Message> {

    constructor(fn: (m: Message) => string) {
        super(fn)
    }

    getMessageForChat = async (chatId: ChatId) => await this.get(
        queries.ofChat(chatId),
        async () => await messageModel.getByChatId(chatId),
        (m: Message) => [ 
            queries.id(m.id) , 
            queries.ofChat(m.chatId)
        ]
    )

    getMessagesForUser = async (userId: UserId) => await this.get(
        queries.ofUser(userId),
        async () => await messageModel.getForUser(userId),
        (m: Message) => [
            queries.ofUser(userId), 
            queries.id(m.id), 
            queries.ofChat(m.chatId)
        ]
    )

    insertMessage = async (message: Message) => this.insert(
        message,
        [ 
            queries.id(message.id), 
            queries.ofChat(message.chatId), 
            queries.ofUser(message.userId)
        ],
        messageModel.create
    )

}