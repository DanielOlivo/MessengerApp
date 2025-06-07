import db from "../config/db";
import { UserId, ChatId } from "shared/src/Types";
import { Cache, getCache } from "./cache";
import chatInfoModel from '../models/chatInfo'
import { ChatInfo } from "../models/models";
import { AsyncQueue } from "utils/taskQueue";

const queries = {
    id: (id: string) => `id=${id}`,
    ofChat: (chatId: ChatId) => `ofchat=${chatId}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`
}

export class ChatInfoCache extends Cache<ChatInfo> {
    constructor(queue: AsyncQueue | undefined = undefined){
        super(info => info.id, queue)
    }

    getForUserId = async(userId: UserId, chatIds: ChatId[]) => await this.get(
        queries.ofUser(userId),
        async () => chatInfoModel.getByChatIds(chatIds),
        (ci: ChatInfo) => [
            queries.ofChat(ci.chatId),
            queries.ofUser(userId)
        ]
    )
    // getChatInfoOfUser = async (userId: UserId) => await this.get(
    //     queries.ofUser(userId),
    //     async () => await db 
    //         .with('m', db('memberships').where({userId}).select('chatId as id'))
    //         .select(['ci.id', 'ci.chatId', 'ci.name', 'ci.iconSrc']).from('chatinfo as ci').whereIn('chatId', db('m')),
    //     (i: ChatInfo) => [
    //         queries.id(i.id), 
    //         queries.ofUser(userId)]
    // )

    getChatInfo = async (chatId: ChatId) => await this.get(
        queries.ofChat(chatId),
        async () => await chatInfoModel.getByChatId(chatId),
        (info: ChatInfo) => [
            queries.id(info.id), 
            queries.ofChat(info.chatId)]
    )

    insertChatInfo = (info: ChatInfo) => this.insert(
        info,
        [ queries.id(info.id), queries.ofChat(info.chatId) ],
        () => chatInfoModel.create(info)
    )

    updateChatInfo = (info: ChatInfo) => this.update(
        info,
        async () => chatInfoModel.update(info),
    )

}