import db from '../config/db'
import { UserId, ChatId } from "../types/Types"

export default {
    removeGroup,
    addMember,
    uuid,
    createGroup, 
    sendMessage,
    isChatMember,
    chatData,
    isDm,
    groupMemberCount,
    memberCount,
    headerInfo,
    dmName,
    groupName,
    messages,
    getMessages,
    chatMessages,
    isGroupAdmin,
}

export function removeGroup(userId: UserId, chatId: ChatId){
    return db
        .with("hasRight", db('memberships').where({userId, groupId: chatId}).select('isAdmin'))
        .with('limit', db.raw(`select case when (??)=true then 1 else 0 end`, db('hasRight')))
        .with('toRemove', db.select(db.raw(`\'${chatId}\'::uuid as "chatId"`), '*').from('hasRight').where("isAdmin", true))
        // .select('*').from('toRemove')
        .with('removed', db('chats').whereIn("id", db.select("chatId").from('toRemove')).del().returning('*'))
        .select('*').from('removed').first()
}

export function addMember(userId: UserId, chatId: ChatId){
    // later 
}

export function uuid(name: string, id: string){
    return db.select('*').fromRaw(`(select \'${id}\'::uuid as "${name}")`).first()
}

export function createGroup(userId: UserId, name: string){
    return db 
        .with("chatId", db('chats').insert({isDm: false}).returning('id'))
        .with('gr', db('groups').insert({name, id: db('chatId')}).returning(['name', 'id as chatId']))
        .with('member', db('memberships').insert({userId, isAdmin: true, groupId: db('chatId')}).returning('userId'))
        .select('*').fromRaw('gr, member').first()
}

export function sendMessage(userId: UserId, chatId: ChatId, content: string){
    return db
        .with('userId', db.raw(`(SELECT \'${userId}\'::uuid as "userId")`))
        .with('chatId', db.raw(`(select \'${chatId}\'::uuid as "chatId")`))
        .with("content", db.raw(`(select \'${content}\' as content)`))
        .with('hasRight', isChatMember(db("userId"), db("chatId")))
        .with("toInsert", db.select("userId", "chatId", "content").fromRaw('"userId", "chatId", "content", "hasRight"').where("isMember", true))
        .with('inserted', 
            db.into(db.raw('?? (??, ??, ??)', ["messages", "userId", "chatId", "content"]))
            .insert(db("toInsert"))
            .returning("*"))
        .select('i.created', 'content', 'chatId', 'username', "userId"
            // db.raw(`(select case when "userId"=\'${userId}\' then true else false end as "isOwner")`)
        ).from("inserted as i")
        .leftJoin('users', 'users.id', "i.userId")
        .first()
}

export function isChatMember(userId: any, chatId: any){
    return db 
        .with('group', db('memberships').count("id as a").where("userId", userId).andWhere("groupId", chatId))
        // .select('*').from('group')
        .with("dm", db('dms').where("id", chatId))
        .with("countLeft", db("dm").count('id as b').where("user1Id", userId))
        .with("countRight", db("dm").count('id as c').where("user2Id", userId))
        .with('result', db.select(db.raw('(a + b + c)=1 as "isMember"')).fromRaw('"group", "countLeft", "countRight"'))
        .select('*').from('result').first()
        // .select(db.raw('(a + b + c)=1 as "isMember"')).fromRaw('"group", "countLeft", "countRight"')
}

export function chatData(userId: UserId, chatId: ChatId){
    return db
        .with('chat_id', db('chats').where({id: chatId}).select('id as chatId'))
        .with('chatMessages', chatMessages(db('chat_id')))
        .select('*').from('chatMessages')
}

export function isGroupAdmin(userId: any, chatId: any){
    return db 
        .with('count', db('memberships').count('id').where('userId', userId).andWhere('groupId', chatId).andWhere('isAdmin', true))
        .select(db.raw('"count" = 1 as "isAdmin"')).from('count')
}

export function chatMessages(chatId: any){
    return db 
        .with('m', messages(chatId))
        .select('m.content', 'm.created', 'username').from('m')
        .leftJoin('users', 'users.id', 'm.userId')
}

export function messages(chatId: any){
    return db('messages').where("chatId", chatId).orderBy('created', 'asc')
}

export function getMessages(userId: UserId, chatId: ChatId){
    return db
        .with("user", uuid("userId", userId))
        .with("m", db('messages').where({chatId}))
        .select("m.content", "m.created", "username",
            db.raw(`(select case when m."userId"=\'${userId}\' then true else false end as "isOwner")`)
        ).from('m')
        .leftJoin('users', 'users.id', 'm.userId')
        .orderBy("m.created", "asc")
}

export function chatName(userId: any, chatId: any){
    return db 
        .with('dmName', dmName(userId, chatId))
        .with('groupName', groupName(chatId))
        .select('*').from('dmName').union(db('groupName')).first()
}

export function groupName(chatId: any){
    return db('groups').where('id', chatId).select('name as chatName').first()
}

export function dmName(userId: any, dmId: any){
    return db
        .with('dm', db('dms').where('id', dmId))
        .with('user1', db('dm').select('user1Id as userId'))
        .with('user2', db('dm').select('user2Id as userId'))
        .with('total', db('user1').union(db('user2')))
        .select('username as chatName').from('total').whereNot('userId', userId)
        .join('users', 'id', '=', 'userId').first()
}

export function getHeaderInfo(userId: UserId, chatId: ChatId){
    return db 
        .with("chatId", uuid("chatId", chatId))
        .with("userId", uuid("userId", userId))
        .with("isDm", isDm(chatId))
        .with("memberCount", memberCount(db("isDm"), db("chatId")))
        .with('chatName', chatName(db("userId"), db("chatId"))) 
        .select('*').fromRaw('(select * from "chatName", "memberCount")').first()
}

export function headerInfo(userId: any, chatId: any){
    return db
        .with("isDm", isDm(chatId))
        .with("memberCount", memberCount(db("isDm"), chatId))
        .with('chatName', chatName(userId, chatId)) 
        .select('*').fromRaw('(select * from "chatName", "memberCount")').first()
}

export function memberCount(isDm: any, chatId: any){
    return db.raw(`select case when (??) then 2 else (??) end as count`, [isDm, groupMemberCount(chatId)])
}

export function groupMemberCount(chatId: any){
    return db('memberships').count("id").where("groupId", db(chatId)).first()
}

export function isDm(chatId: ChatId){
    return db("chats").where({id: chatId}).select('isDm').first()
}