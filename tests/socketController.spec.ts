process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll, afterEach, beforeEach} from '@jest/globals'
import { TokenPayload, UserId, DM, Message, Group } from '../types/Types'
import unreadModel, {Unread} from '../models/unread'
import socketController, {Res} from '../controllers/socket'
import userModel from '../models/users'
import db from '../config/db'

describe('socket controller', () => {

    let user1Id: UserId
    let user2Id: UserId
    let user3Id: UserId

    let token1: TokenPayload
    let token2: TokenPayload
    let token3: TokenPayload

    let dm12: DM
    let msg12: Message
    let unread: Unread[]
    let dudes: Group
    let msgDudes: Message

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()

        const user1 = await userModel.create('user1', 'hashed')
        const user2 = await userModel.create('user2', 'hashed')
        const user3 = await userModel.create('user3', 'hashed')

        token1 = {id: user1.id, username: 'user1'}
        token2 = {id: user2.id, username: 'user2'}
        token3 = {id: user3.id, username: 'user3'}
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    test('user1.getChats - gets none', async() => {
        const {sendBefore} = await socketController.getChats(token1, '')

        expect(sendBefore).toBeDefined()
        expect(sendBefore[token1.id]).toBeDefined()

        const {dms, groups} = sendBefore[token1.id]
        expect(dms.length).toEqual(0)
        expect(groups.length).toEqual(0)
    }) 

    test('user1.search for "user" - he gets user2 and user3', async() => {
        const {sendBefore} = await socketController.search(token1, 'user')
        expect(sendBefore).toBeDefined()
        expect(sendBefore![token1.id]).toBeDefined()

        const {groups, users} = sendBefore![token1.id]
        expect(groups.length).toEqual(0)
        expect(users.length).toEqual(2)
    })

    test('user1.getDm with user2', async() => {
        const {join, sendAfter} = await socketController.getDm(token1, token2.id)
        expect(join).toBeDefined()
        expect(sendAfter).toBeDefined()

        expect(token1.id in join).toBeTruthy()
        expect(token2.id in join).toBeTruthy()

        dm12 = sendAfter[token1.id]
    })

    test('user1.msg', async() => {
        const {sendAfter} = await socketController.msg(token1, {chatId: dm12.id, content: 'hey'}) as Res<{message: Message, unread: Unread[]}>
        expect(sendAfter).toBeDefined()
        expect(sendAfter![dm12.id]).toBeDefined()

        const message = sendAfter![dm12.id].message
        expect(message).toBeDefined()
        expect(message.content).toEqual('hey')
        expect(message.chatId).toEqual(dm12.id)
        expect(message.userId).toEqual(token1.id)
        msg12 = message

        unread = sendAfter![dm12.id].unread
        expect(unread).toBeDefined()
        expect(unread.length).toEqual(2)
    })

    test('unread table has two records', async() => {
        const all = await unreadModel.getAll()
        expect(all).toBeDefined()
        expect(all.length).toEqual(2)

        expect(all.map(un => un.userId).includes(token1.id)).toBeTruthy()
        expect(all.map(un => un.userId).includes(token2.id)).toBeTruthy()
        expect(all[0].messageId).toEqual(msg12.id)
        expect(all[1].messageId).toEqual(msg12.id)
    })


    test('user1.unread (gets one)', async() => {
        const {sendBefore} = await socketController.unread(token1, '')
        expect(sendBefore).toBeDefined()
        expect(Object.keys(sendBefore).length).toEqual(1)

        const [msg] = sendBefore[token1.id]
        expect(msg).toBeDefined()
        expect(msg.userId).toEqual(token1.id)
    })

    test('user2.unread (gets one)', async() => {
        const {sendBefore} = await socketController.unread(token2, '')
        expect(sendBefore).toBeDefined()
        expect(Object.keys(sendBefore).length).toEqual(1)
        // console.log(sendBefore)

        const [msg] = sendBefore[token2.id]
        expect(msg).toBeDefined()
        expect(msg.userId).toEqual(token1.id)

    })

    test('user1.msg.read', async() => {
        const {sendBefore} = await socketController.readMsg(token1, msg12)
        expect(sendBefore).toBeDefined()
        expect(dm12.id in sendBefore).toBeTruthy()
    })

    test('unread table has one record', async() => {
        const all = await unreadModel.getAll()
        expect(all.length).toEqual(1)
    })

    test('user1.unread (gets none)', async() => {
        const {sendBefore} = await socketController.unread(token1, '')
        // console.log('sendBefore', sendBefore)
        expect(sendBefore).toBeDefined()
        expect(Object.keys(sendBefore).length).toEqual(1)

        const msgs = sendBefore[token1.id]
        expect(msgs.length).toEqual(0)
    })

    test('user2.msg.read', async() => {
        const {sendBefore} = await socketController.readMsg(token2, msg12)
        expect(sendBefore).toBeDefined()
        expect(dm12.id in sendBefore).toBeTruthy()
    })

    test('unread table has no records', async() => {
        const all = await unreadModel.getAll()
        expect(all.length).toEqual(0)
    })

    test('user2.unread (gets none)', async() => {
        const {sendBefore} = await socketController.unread(token2, '')
        expect(sendBefore).toBeDefined()
        expect(Object.keys(sendBefore).length).toEqual(1)

        const msgs = sendBefore[token2.id]
        expect(msgs.length).toEqual(0)
    })
    
    test('user1 creates group', async() => {
        const {join, sendAfter} = await socketController.createGroup(token1, 'dudes')

        expect(join).toBeDefined()
        expect(sendAfter).toBeDefined()

        expect(token1.id in join).toBeTruthy()
        expect(token1.id in sendAfter).toBeTruthy()

        const {group, membership} = sendAfter[token1.id]

        expect(group).toBeDefined()
        expect(membership).toBeDefined()

        expect(group.name).toEqual('dudes')
        expect(membership.groupId).toEqual(group.id)
        expect(membership.userId).toEqual(token1.id)
        expect(membership.isAdmin).toBeTruthy()

        dudes = group
    })


    test('user1 sends message to dudes', async() => {
        const {sendAfter} = await socketController.msg(token1, {chatId: dudes.id, content: 'first'})
        expect(sendAfter).toBeDefined()
        expect(token1.id in sendAfter!).toBeDefined()

        const {message, unread} = sendAfter![dudes.id] as {message: Message, unread: Unread[]}
        expect(message).toBeDefined()
        expect(unread).toBeDefined()

        expect(message.content).toEqual('first')
        expect(message.userId).toEqual(token1.id)
        expect(message.chatId).toEqual(dudes.id)
    })


    test('user1.unread (one)', async() => {
        const {sendBefore: {[token1.id]: [message]}} = await socketController.unread(token1, '')
        expect(message).toBeDefined()
        const {content, userId, chatId} = message 
        expect(content).toEqual('first')
        expect(chatId).toEqual(dudes.id)
        expect(userId).toEqual(token1.id)
        msgDudes = message
    })
     
    test('user1.readMsg', async() => {
        const {sendBefore: {[dudes.id]: message}} = await socketController.readMsg(token1, msgDudes)
        expect(message).toBeDefined()
    })

    test('user1.unread (gets none)', async() => {
        const {sendBefore: {[token1.id]: msgs}} = await socketController.unread(token1, '')
        expect(msgs.length).toEqual(0)
    })


    test('user1 adds user2', async() => {
        const {join: {[token2.id]: roomId}, sendAfter: {[dudes.id]: {group, membership}}} = 
            await socketController.addMember(token1, {chatId: dudes.id, userId: token2.id})        

        expect(roomId).toBeDefined()
        expect(roomId).toEqual(dudes.id)

        expect(group).toBeDefined()
        expect(membership).toBeDefined()

        expect(membership.isAdmin).toBeFalsy()
    })

    test('user1 get messages from dudes (get one)', async() => {
        const {sendBefore} = await socketController.getMessages(token1, dudes.id)
        expect(sendBefore).toBeDefined()
    })
    return

    test('user2 get messages from dudes (gets none)', async() => {
        throw new Error()
    })

    test('user2.msg to dudes', async() => {
        throw new Error()
    })

    test('user2 unread (gets one)', async() => {
        throw new Error()
    })

    test('user1 unread (gets one)', async() => {
        throw new Error()
    })

    test('user2.readMsg', async() => {
        throw new Error()
    })

    test('user1.readMsg', async() => {
        throw new Error()
    })

    test('user1 adds user3', async() => {
        throw new Error()
    })    

    test('user3 get msgs (gets none)', async() => {
        throw new Error()
    })

    test('user3 sends msg', async() => {
        throw new Error()
    })

    test('user1.unread (gets one', async() => {
        throw new Error()
    })

    test('user2.unread (gets one)', async () => {
        throw new Error()
    })

    test('user1 changes the role of user2 (to admin)', async() => {
        throw new Error()
    })

    test('user1 leaves the group', async() => {
        throw new Error()
    })

    test('user2 removes the group', async() => {
        throw new Error()
    })

})