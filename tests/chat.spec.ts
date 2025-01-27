process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import db from '../config/db'
import { UserId, ChatId } from '../types/Types'
import { dmNames, groupNames, chatNames } from '../models/chatList'


describe('chat', () => { 

    let dm: ChatId
    let group: ChatId

    let dmQ: any
    let groupQ: any
    let user1Q: any
    let user2Q: any
    let user3Q: any

    let newGroupId: ChatId

    let user1: UserId
    let user2: UserId
    let user3: UserId

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()

        {
            const {id} = await db('dms').first()
            dm = id
        }

        {
            const {id} = await db('groups').first()
            group = id
        }

        user1Q = db('users').where({username: 'user1'}).select('id').first()
        user2Q = db('users').where({username: 'user2'}).select('id').first()
        user3Q = db('users').where({username: 'user3'}).select('id').first()

        {
            const {id} = await user1Q
            user1 = id
        }

        {
            const {id} = await user2Q
            user2 = id
        }

        {
            const {id} = await user3Q
            user3 = id
        }

        // console.log(user1, user2)

        dmQ = db.select('column1 as chatId').fromRaw(`(values (\'${dm}\'::uuid))`).first()
        groupQ = db('groups').select('id as chatId').first()
        
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    test('dm is dm', async() => {
        const {isDm: result} = await isDm(dm)
        expect(result).toBeTruthy()
    });

    test("group is not dm", async () => {
        const {isDm: result} = await isDm(group)
        expect(result).toBeFalsy()
    })

    test("memberCount", async() => {
        const {count} = await groupMemberCount(dmQ) as {count: string}
        expect(count).toEqual('0')
    })

    test("memberCount for dm", async() => {
        const result = await memberCount(isDm(dmQ), dmQ)
        const [{count}] = result.rows
        expect(count).toEqual('2')
    })

    test('memberCount for group', async () => {
        const result = await memberCount(isDm(groupQ), groupQ)
        const [{count}] = result.rows
        expect(count).toEqual('3')
    })

    test('dmName is user2', async() => {
        const user1 = db('users').where({username: 'user1'}).select('id').first()
        const {chatName} = await dmName(user1, dmQ) as {chatName: string}
        expect(chatName).toEqual('user2')
    })

    test('dmName is user1', async() => {
        const user2 = db('users').where({username: 'user2'}).select('id').first()
        const {chatName} = await dmName(user2, dmQ) as {chatName: string}
        expect(chatName).toEqual('user1')
    })

    test('groupName is dudes', async() => {
        const {chatName} = await groupName(groupQ) as {chatName: string}
        expect(chatName).toEqual('dudes')
    })

    test('chatName is dudes', async() => {
        const result = await chatName(user1Q, groupQ) as {chatName: string}
        expect(result.chatName).toEqual('dudes')
        // console.log(result)
    })

    test('chatName is user2', async() => {
        const result = await chatName(user1Q, dmQ) as {chatName: string}
        expect(result.chatName).toEqual('user2')
        // console.log(result)
    })

    test('chatName is user1', async() => {
        const result = await chatName(user2Q, dmQ) as {chatName: string}
        expect(result.chatName).toEqual('user1')
        // console.log(result)
    })

    test('header info for dm for user1', async() => {
        const result = await headerInfo(user1Q, dmQ)
        // console.log(result)
        expect(result.chatName).toEqual("user2")
        expect(result.count).toEqual('2')
    })

    test('header for dm for user2', async() => {
        const result = await headerInfo(user2Q, dmQ)
        // console.log(result)
        expect(result.chatName).toEqual("user1")
        expect(result.count).toEqual('2')
    })

    test('header for group', async() => {
        const result = await headerInfo(user1Q, groupQ)
        // console.log(result)
        expect(result.chatName).toEqual("dudes")
        expect(result.count).toEqual('3')
    })

    test('messages of dm', async() => {
        const result = await messages(dmQ)
        // console.log(result)
        expect(result[0].content).toEqual('hey')
        expect(result[1].content).toEqual('whats up')
    })

    test('messages of group', async() => {
        const result = await messages(groupQ)
        expect(result[0].content).toEqual('first')
        expect(result[1].content).toEqual('second')
        expect(result[2].content).toEqual('third')
    })

    test('dm message to display', async() => {
        const result = await chatMessages(dmQ)
        expect(result.length).toEqual(2)
    })

    test('group message to display', async() => {
        const result = await chatMessages(groupQ)
        // console.log(result)
        expect(result.length).toEqual(3)
    })

    test('isGroupAdmin: user1 (yes)', async() => {
        // const _isDm = db('chats').where("id", groupQ).select("isDm")       
        const result = await db(isGroupAdmin(user1Q, groupQ))
        // console.log(result)
        expect(result).toBeDefined()
        expect(result[0].isAdmin).toBeDefined()
        expect(result[0].isAdmin).toBeTruthy()
        // console.log(isAdmin)
    })

    test('isGroupAdmin: user2 (no)', async() => {
        // const _isDm = db('chats').where("id", groupQ).select("isDm")       
        const result = await db(isGroupAdmin(user2Q, groupQ))
        // expect(isAdmin).toBeFalsy()
        // console.log(result)
        expect(result).toBeDefined()
        expect(result[0].isAdmin).toBeDefined()
        expect(result[0].isAdmin).toBeFalsy()
    })

    test('isGroupAdmin: user2 in dm (no)', async() => {
        // const _isDm = db('chats').where("id", dmQ).select("isDm")       
        const result = await db(isGroupAdmin(user2Q, dmQ))
        // console.log(result)
        expect(result).toBeDefined()
        expect(result[0].isAdmin).toBeDefined()
        expect(result[0].isAdmin).toBeFalsy()
        // expect(isAdmin).toBeFalsy()
        // console.log(result)
    })

    test('isChatMember: user1 in dm', async() => {
        const result = await isChatMember(user1Q, dmQ)
        // console.log(result)
        expect(result).toBeDefined()
        expect(result.isMember).toBeDefined()
        expect(result.isMember).toBeTruthy()
    })

    test('isChatMember: user2 in dm', async() => {
        const result = await isChatMember(user2Q, dmQ)
        // console.log(result)
        expect(result).toBeDefined()
        expect(result.isMember).toBeDefined()
        expect(result.isMember).toBeTruthy()
    })

    test('isChatMember: user3 in dm (he is not)', async() => {
        const result = await isChatMember(user3Q, dmQ)
        // console.log(result)
        expect(result).toBeDefined()
        expect(result.isMember).toBeDefined()
        expect(result.isMember).toBeFalsy()
    })
    
    test('sendMessage: user1 to dm', async() => {
        // const result = await sendMessage(user1, dm, 'message!!!')
        // console.log(result)
        const {id, userId, chatId, content} = await sendMessage(user1, dm, 'message!!!')
        expect(id).toBeDefined()
        expect(userId).toBeDefined()
        expect(chatId).toBeDefined()
        expect(content).toBeDefined()

        expect(userId).toEqual(user1)
        expect(chatId).toEqual(dm)
        expect(content).toEqual('message!!!')
    })

    test('sendMessage: user2 to dm', async() => {
        // const result = await sendMessage(user1, dm, 'message!!!')
        // console.log(result)
        const {id, userId, chatId, content} = await sendMessage(user2, dm, 'other one')
        expect(id).toBeDefined()
        expect(userId).toBeDefined()
        expect(chatId).toBeDefined()
        expect(content).toBeDefined()

        expect(userId).toEqual(user2)
        expect(chatId).toEqual(dm)
        expect(content).toEqual('other one')
    })

    test("sendMessage: user3 to dm (he can not)", async() => {
        const result = await sendMessage(user3, dm, 'other one')
        expect(result).toBeUndefined()
    })

    test('user1 creates new chat', async() => {
        const result = await createGroup(user1, 'new group')
        expect(result.name).toEqual('new group')
        newGroupId = result.chatId
        // console.log(result)
    })

    test('user1 removes new chat', async() => {
        const result = await removeGroup(user1, newGroupId)
        expect(result.id).toBeDefined()
        // console.log(result)
    })

    // test('chatData: user1', async() => {
    //     const {id} = await user1Q
    //     const {chatId} = await dmQ
    //     console.log(id, chatId)
    //     const result = await chatData(id, chatId)
    //     console.log(result)
    // })

})

function removeGroup(userId: UserId, chatId: ChatId){
    return db
        .with("hasRight", db('memberships').where({userId, groupId: chatId}).select('isAdmin'))
        .with('limit', db.raw(`select case when (??)=true then 1 else 0 end`, db('hasRight')))
        .with('toRemove', db.select(db.raw(`\'${chatId}\'::uuid as "chatId"`), '*').from('hasRight').where("isAdmin", true))
        // .select('*').from('toRemove')
        .with('removed', db('chats').whereIn("id", db.select("chatId").from('toRemove')).del().returning('*'))
        .select('*').from('removed').first()
}

function addMember(userId: UserId, chatId: ChatId){
    
}

function createGroup(userId: UserId, name: string){
    return db 
        .with("chatId", db('chats').insert({isDm: false}).returning('id'))
        .with('gr', db('groups').insert({name, id: db('chatId')}).returning(['name', 'id as chatId']))
        .with('member', db('memberships').insert({userId, isAdmin: true, groupId: db('chatId')}).returning('userId'))
        .select('*').fromRaw('gr, member').first()
}

function sendMessage(userId: UserId, chatId: ChatId, content: string){
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
        .select('*').from("inserted").first()
}

function isChatMember(userId: any, chatId: any){
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

function chatData(userId: UserId, chatId: ChatId){
    return db
        .with('chat_id', db('chats').where({id: chatId}).select('id as chatId'))
        .with('chatMessages', chatMessages(db('chat_id')))
        .select('*').from('chatMessages')
}

function isGroupAdmin(userId: any, chatId: any){
    return db 
        .with('count', db('memberships').count('id').where('userId', userId).andWhere('groupId', chatId).andWhere('isAdmin', true))
        .select(db.raw('"count" = 1 as "isAdmin"')).from('count')
}

function chatMessages(chatId: any){
    return db 
        .with('m', messages(chatId))
        .select('m.content', 'm.created', 'username').from('m')
        .leftJoin('users', 'users.id', 'm.userId')
}

function messages(chatId: any){
    return db('messages').where("chatId", chatId).orderBy('created', 'asc')
}


function chatName(userId: any, chatId: any){
    return db 
        .with('dmName', dmName(userId, chatId))
        .with('groupName', groupName(chatId))
        .select('*').from('dmName').union(db('groupName')).first()
}

function groupName(chatId: any){
    return db('groups').where('id', chatId).select('name as chatName').first()
}

function dmName(userId: any, dmId: any){
    return db
        .with('dm', db('dms').where('id', dmId))
        .with('user1', db('dm').select('user1Id as userId'))
        .with('user2', db('dm').select('user2Id as userId'))
        .with('total', db('user1').union(db('user2')))
        .select('username as chatName').from('total').whereNot('userId', userId)
        .join('users', 'id', '=', 'userId').first()
}

function headerInfo(userId: any, chatId: any){
    return db
        .with("isDm", isDm(chatId))
        .with("memberCount", memberCount(db("isDm"), chatId))
        .with('chatName', chatName(userId, chatId)) 
        .select('*').fromRaw('(select * from "chatName", "memberCount")').first()
}

function memberCount(isDm: any, chatId: any){
    return db.raw(`select case when (??) then 2 else (??) end as count`, [isDm, groupMemberCount(chatId)])
}

function groupMemberCount(chatId: any){
    return db('memberships').count("id").where("groupId", db(chatId)).first()
}

function isDm(chatId: ChatId){
    return db("chats").where({id: chatId}).select('isDm').first()
}