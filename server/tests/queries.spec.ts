process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import db from '../config/db'
import { ChatId, DbUser, UserId } from '../types/Types'
import { HeaderInfo } from "../types/Client"

describe('queries', () => {

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    test('big test', async() => {

        const allUsers = await getAllUser()
        expect(allUsers.length).toEqual(4)

        const {id: user1Id} = await getIdOf('user1')
        expect(user1Id).toBeDefined()

        const {id: dm12Id} = await db('dms').first().select('id')
        expect(dm12Id).toBeDefined()

        const {id: dudesId} = await db('groups').first().select('id')

        {
            const {username} = await getUser1()
            expect(username).toEqual('user1')
        }

        {
            const dms = await allDmsOf(user1Id)
            expect(dms.length).toEqual(1)
        }

        {
            const groups = await allGroupsOf(user1Id)
            expect(groups.length).toEqual(1)
        }

        {
            const allChats = await allChatsOf(user1Id)
            expect(allChats.length).toEqual(2)
        } 


        {
            const dmMems = await dmMembers(dm12Id)
            // console.log(dmMems)
            expect(dmMems).toBeDefined()
            expect(dmMems.length).toEqual(2)
        }

        {
            const {chatName} = await dmName(dm12Id, user1Id)
            expect(chatName).toBeDefined()
            expect(chatName).toEqual('user2')
        }

        {
            const _dmOthers = await dmOthers(user1Id)
            // console.log(_dmOthers)
            expect(_dmOthers.length).toEqual(1)
        }

        {
            const _dmNames = await dmNames(user1Id)
            expect(_dmNames.length).toEqual(1)
            // console.log(_dmNames)
        }

        {
            const _groupNames = await groupNames(user1Id)
            // console.log(_groupNames)
            expect(_groupNames.length).toEqual(1)
        }

        {
            const _chatNames = await chatNames(user1Id)
            // console.log(_chatNames)
            expect(_chatNames.length).toEqual(2)
        }

        {
            // headerinfo for dm12
            const result = await headerInfo(user1Id, dm12Id)
            expect(result).toBeDefined()
        }

        {
            // headerinfo for group
            const {chatId, chatName,isDm, count} = await headerInfo(user1Id, dudesId)
            expect(chatId).toEqual(dudesId)
            expect(chatName).toEqual('dudes')
            expect(isDm).toBeFalsy()
            expect(count).toEqual('3')
        }

        {
            // const result = await lastMessages([dm12Id, dudesId])
            // expect(result.length).toEqual(2)
            // console.log(result)
        }

        {
            const result = await chatList(user1Id)
            console.log(result)
        }

        const result = await unreadFor(user1Id, chatList(user1Id))
        console.log(result)

        expect(1).toEqual(1)
    })
})



function chatList(userId: UserId){
    return db.with('names', db(chatNames(userId)))
        .with('last', lastMessages(db('names')))
        .select('*').from('names')
        .join('last', "last.chatId", "names.chatId")
}

function unreadFor(userId: UserId, chats: any) {
    return db.with("_chats", db.select("chatId").from(db(chats)))
        // .with('unseen', db('unread').where({userId}).whereIn("unread.chatId", db("_chats")))
        .select('*').from('_chats')

}

function lastMessages(chats: any){
    return db.with('m', db('messages').whereIn("chatId", db.select("chatId").from(chats)))
        .with('sorted', db('m').rank('idx', b => b.partitionBy("chatId").orderBy("created", "desc")).select('*'))
        .select('*').from('sorted').where({idx: '1'})
}

async function getChatListc(id: UserId) {
    const result = await db.raw(`

        with dmids as (
            select id from dms where "user1Id"=\'${id}\' or "user2Id" = \'${id}\'
        )
        , dmnames as (
            select "dmId" as "chatId", username as "chatName"
            from "users"
            join 
                (select 
                    id as "dmId", 
                    case when "user1Id"=\'${id}\' then "user2Id" else "user1Id" end as "userId"
                from (select * from dms where "id" in (select * from dmids)))
            on "userId" = users.id
        )
        , groupids as (
            select "groupId" from memberships where "userId" = \'${id}\'
        )
        , groupnames as (
            select id as "chatId", name as "chatName"
            from groups 
            where "id" in (select * from groupids)
        )
        , chatnames as (
            select * from dmnames union select * from groupnames
        )
        , allids as (
            select * from dmids union select * from groupids
        )
        , last_messages as (
            select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created desc) as rn
            from (select * from messages where "chatId" in (select * from allids)) as m
        )
        ,unseen as (
            with msgs as (
                select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created asc) as rn
                from (select * from messages) as m
            )
            , counts as (
                select "chatId", count(id) as count from messages group by "chatId"
            )
            select counts."chatId", counts.count, msgs.rn as first_unread,
                case when msgs.rn is null then 0 else counts.count-msgs.rn+1 end as "unreadCount"
            from msgs
            right join unread on "messageId"=msgs.id
            full join counts on counts."chatId"=msgs."chatId"
        )
        select content, "chatName", lm."chatId", username, "unreadCount"
        from (select * from last_messages where rn=1) as lm
        join chatnames on chatnames."chatId"=lm."chatId"
        join users on users.id=lm."userId"
        full join unseen on unseen."chatId"=lm."chatId";
    `)
    // console.log(result.rows)
    return result.rows
}


function headerInfo(userId: UserId, chatId: ChatId){
    return db.with('grName', db.select("chatId", "chatName").from(groupNames(userId).where({chatId})))
        .with('dmName', db.select("chatId", "username as chatName").from(dmOthers(userId).where({chatId})))
        .with('together', db('grName').union(db('dmName')))
        .with('is_dm', db('chats').where({id: chatId}).select('isDm', "id as chatId"))
        .with('grMemberCount', db('memberships').count('id').where({groupId: chatId}))
        .with('totalCount', db.raw(`select case when (select "isDm" from is_dm) then 2 else (select * from "grMemberCount") end as count`))
        .select('*').fromRaw('together, is_dm, "totalCount"').first()
}


function chatNames(userId: UserId) {
    return dmNames(userId).union(function(){
        this.select('*').from(groupNames(userId))
    })
}


function groupNames(userId: UserId){
    return db.with("grIds", db('memberships').where({userId}).select("groupId as chatId"))
        .select('chatId', "name as chatName").from('groups')
        .rightJoin('grIds', "chatId", "groups.id")
}

function dmNames(userId: UserId){
    return db.select("chatId", "username as chatName").from(dmOthers(userId))
}

function dmOthers(userId: UserId){
    return db.with('_dms', db('dms').select("id as chatId", "user1Id", "user2Id").where({user1Id: userId}).orWhere({user2Id: userId}))
        .with("users1", db.select("chatId", "user1Id as userId").from("_dms").whereNot({user1Id: userId}))
        .with("users2", db.select("chatId", "user2Id as userId").from("_dms").whereNot({user2Id: userId}))
        .with('together', db('users1').union(db('users2')))
        .select("userId", "chatId", "username").from('together')
        .join('users', "users.id", "together.userId")
}

function dmName(chatId: ChatId, userId: UserId){
    return db.with('members', dmMembers(chatId))
        .select('username as chatName').from('members')
        .join('users', "users.id", "members.id")
        .whereNot("members.id", userId)
        .first()
}

function dmMembers(chatId: ChatId){
    return db.with('dm', dmWithId(chatId).select("user1Id", "user2Id", "id as chatId"))
        .select("chatId", "user1Id as id").from("dm").union(db.select("chatId", "user2Id as id").from("dm"))
}

function allChatsOf(userId: UserId){
    return db.with('dms', allDmsOf(userId))
        .with('groups', allGroupsOf(userId))
        .select('*').from('dms').union(db.select('*').from('groups'))
}


function getIdOf(username: string){
    return db('users').where({username}).first()
}

function allDmsOf(userId: UserId){
    return db('dms').where("user1Id", userId).orWhere("user2Id", userId).select('id as chatId')
}

function allGroupsOf(userId: UserId){
    return db('memberships').where('userId', userId).select('groupId as id')
}

function dmWithId(chatId: ChatId){
    return db('dms').where({id: chatId})
}

async function getUser1() {
    return db('users').where({username: 'user1'}).first()
}

async function getAllUser(){
    return await db('users')
}
