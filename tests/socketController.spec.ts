process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll, afterEach, beforeEach} from '@jest/globals'
import { TokenPayload, UserId, DM, Message } from '../types/Types'
import {Unread} from '../models/unread'
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
    let unread: Unread[]

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

        unread = sendAfter![dm12.id].unread
        expect(unread).toBeDefined()
        expect(unread.length).toEqual(2)
    })

    test('user1.msg.read', async() => {
        const unread1 = unread.filter(un => un.userId == token1.id)[0]

        const {sendBefore} = await socketController.readMsg(token1, unread1)
        expect(sendBefore).toBeDefined()
        expect(dm12.id in sendBefore).toBeTruthy()
    })

    test('user2.msg.read', async() => {
        const unread2 = unread.filter(un => un.userId == token2.id)[0]

        const {sendBefore} = await socketController.readMsg(token2, unread2)
        expect(sendBefore).toBeDefined()
        expect(dm12.id in sendBefore).toBeTruthy()

    })

})