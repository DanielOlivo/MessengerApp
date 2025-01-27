process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import db from '../config/db'
import { ChatId, UserId } from '../types/Types'
import { chatList, lastMessages, chatNames, groupNames, dmNames, dmOthers } from '../models/chatList'

describe('chat list', () => {

    let user1: UserId;
    let dm: ChatId;
    let group: ChatId

    let chatIds: any

    let _dmOthers: any

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()

        const {id} = await db('users').where({username: 'user1'}).first().select('id')
        user1 = id
        // console.log(user1)
     
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })


    test('dmOthers', async() => {
        const [{userId, chatId, username}] = await dmOthers(user1)
        expect(userId).toBeDefined()
        expect(chatId).toBeDefined()
        expect(username).toEqual('user2')

        dm = chatId
        _dmOthers = dmOthers(user1)
    })

    test('dmNames', async() => {
        const [{chatName, chatId}] = await dmNames(_dmOthers)
        expect(chatName).toEqual('user2')
        expect(chatId).toBeDefined()
    })

    test('groupNames', async() => {
        const [{chatId, chatName}] = await groupNames(user1) 
        expect(chatId).toBeDefined()
        expect(chatName).toEqual('dudes')

        group = chatId
    })

    test('select from list of chats', async() => {
        chatIds = db.select('column1 as chatId').fromRaw(`(values (\'${dm}\'::uuid), (\'${group}\'::uuid))`)
        const result = await chatIds
        expect(result.length).toEqual(2)
    })

    test('last messages', async () => {
        const result = await lastMessages(chatIds)
        // console.log(result)
        expect(result.length).toEqual(2)
    }) 

    test('chat list', async () => {
        const result = await chatList(user1)
        console.log(result)
        expect(result.length).toEqual(2)
    })

    test('check', () => expect(true).toBeTruthy())

})

// function chatList(userId: UserId){
//     return db
//         .with("dmOthers", dmOthers(userId))
//         .with("dmNames", dmNames(db("dmOthers"))) 
//         .with("groupNames", groupNames(userId))
//         .with("chatNames", chatNames(db("dmNames"), db("groupNames")))
//         .with("lastMessages", lastMessages(db.select("chatId").from(db("chatNames"))))
//         .select('*').from('lastMessages')
//         .join("chatNames", "chatNames.chatId", "lastMessages.chatId")
//         .orderBy("created", "desc")
// }

// function lastMessages(chats: any){
//     return db
//         .with('m', db('messages').whereIn("chatId", db(chats)))
//         .with('sorted', db('m').rank('idx', b => b.partitionBy("chatId").orderBy("created", "desc")).select('*'))
//         .select('*').from('sorted').where({idx: '1'})
// }

// function chatNames(dmNames: any, groupNames: any){
//     return dmNames.union(groupNames)
// }

// function groupNames(userId: UserId){
//     return db.with("grIds", db('memberships').where({userId}).select("groupId as chatId"))
//         .select('chatId', "name as chatName").from('groups')
//         .rightJoin('grIds', "chatId", "groups.id")
// }

// function dmNames(dms: any){
//     return db(dms).select("chatId", 'username as chatName')
// }

// function dmOthers(userId: UserId){
//     return db.with('_dms', db('dms').select("id as chatId", "user1Id", "user2Id").where({user1Id: userId}).orWhere({user2Id: userId}))
//         .with("users1", db.select("chatId", "user1Id as userId").from("_dms").whereNot({user1Id: userId}))
//         .with("users2", db.select("chatId", "user2Id as userId").from("_dms").whereNot({user2Id: userId}))
//         .with('together', db('users1').union(db('users2')))
//         .select("userId", "chatId", "username").from('together')
//         .join('users', "users.id", "together.userId")
// }