import db from '../config/db'
import { UserId } from "../types/Types"

export default {
    chatList,
    lastMessages,
    chatNames,
    groupNames,
    dmNames,
    dmOthers
}

/**
 * 
 * @param userId 
 * @returns idx, id, userId, chatId, content, created, read, chatName, username
 */
export function chatList(userId: UserId){
    return db
        .with("dmOthers", dmOthers(userId))
        .with("dmNames", dmNames(db("dmOthers"))) 
        .with("groupNames", groupNames(userId))
        .with("chatNames", chatNames(db("dmNames"), db("groupNames")))
        .with("lastMessages", lastMessages(db.select("chatId").from(db("chatNames"))))
        // .select('*').from('lastMessages')
        .select('chatName', "content", "username", "chatNames.chatId").from('lastMessages')
        .join("chatNames", "chatNames.chatId", "lastMessages.chatId")
        .join('users', "users.id", "userId")
        .orderBy("lastMessages.created", "desc")
}

export function lastMessages(chats: any){
    return db
        .with('m', db('messages').whereIn("chatId", db(chats)))
        .with('sorted', db('m').rank('idx', b => b.partitionBy("chatId").orderBy("created", "desc")).select('*'))
        .select('*').from('sorted').where({idx: '1'})
}

export function chatNames(dmNames: any, groupNames: any){
    return dmNames.union(groupNames)
}

export function groupNames(userId: UserId){
    return db.with("grIds", db('memberships').where({userId}).select("groupId as chatId"))
        .select('chatId', "name as chatName").from('groups')
        .rightJoin('grIds', "chatId", "groups.id")
}

export function dmNames(dms: any){
    return db(dms).select("chatId", 'username as chatName')
}

export function dmOthers(userId: UserId){
    return db.with('_dms', db('dms').select("id as chatId", "user1Id", "user2Id").where({user1Id: userId}).orWhere({user2Id: userId}))
        .with("users1", db.select("chatId", "user1Id as userId").from("_dms").whereNot({user1Id: userId}))
        .with("users2", db.select("chatId", "user2Id as userId").from("_dms").whereNot({user2Id: userId}))
        .with('together', db('users1').union(db('users2')))
        .select("userId", "chatId", "username").from('together')
        .join('users', "users.id", "together.userId")
}