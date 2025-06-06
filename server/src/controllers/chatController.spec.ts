process.env.NODE_ENV = 'test'

import { describe, it, expect, beforeAll, afterAll, afterEach, jest, beforeEach } from '@jest/globals'
import db from '../config/db'
import { 
    userCache,
    pinCache,
    messageCache,
    chatCache,
    controller, 
    chatInfoCache,
    membershipCache
} from './chatController'
import { User } from '../models/models'
import { chatMessages } from '../models/chat'
import { wait } from 'shared/src/utils'
import { Message, MessagePostReq, isMessage } from 'shared/src/Message'
import { faker } from '@faker-js/faker/.'
import userModel from "../models/users"
import { DbUtils } from '../utils/db'


// maybe it would be way easier to create db in the beginning of test here
// instead referencing seed...

describe('chat controller specs', () => {
    const utils = new DbUtils()

    beforeAll(async () => {
        await db.migrate.rollback()
        await db.migrate.latest()
    })

    afterAll(async () => {
        await db.migrate.rollback()
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    beforeEach(async () => {
        await utils.clean() 

        userCache.reset()
        chatCache.reset()
        chatInfoCache.reset()
        messageCache.reset()
        membershipCache.reset()
        pinCache.reset()

    })

    const assertEmptyDb = async () => {
        const users = await db('users')
        const chats = await db('chats')
        const chatInfo = await db('chatinfo')

        expect([users, chats, chatInfo].every(arr => arr.length === 0)).toBeTruthy()
    }

    it('handleUsersRequest', async () => {
        await assertEmptyDb()

        const [user1, user2, user3] = await utils.addRandomUsers(3) 
        const { chat: dm1 } = await utils.getDm(user1.id, user2.id) 
        const { chat: dm2 } = await utils.getDm(user1.id, user3.id)

        const res = await controller.handleUsersRequest(user1.id)

        expect(user2.id in res).toBeTruthy()
        expect(user3.id in res).toBeTruthy()

        expect(chatInfoCache.items.size).toEqual(0)
        expect(chatCache.items.size).toEqual(2)
        expect(pinCache.items.size).toEqual(0)
        expect(messageCache.items.size).toEqual(0)
    })


    it('handleSearch', async () => {
        await assertEmptyDb()

        // setup db
        const [user1, user2] = await utils.addRandomUsers(2)

        let res = await controller.handleSearch(user1.id, user2.username)
        expect(res).toBeDefined()
        expect(user2.id in res).toBeTruthy()
        expect(userCache.items.size).toEqual(1)

        res = await controller.handleSearch(user2.id, user1.username)
        expect(res).toBeDefined()
        expect(user1.id in res).toBeTruthy()
        expect(userCache.items.size).toEqual(2)
    })


    it('handleInitLoading', async () => {
        // setup db        
        const [user1, user2] = await utils.addRandomUsers(2)
        const { chat: dm } = await utils.getDm(user1.id, user2.id)
        const msgs = await utils.addRandomMessages(dm.id) 

        const res = await controller.handleInitLoading(user1.id) 
        expect(res).toBeDefined()

        expect(chatInfoCache.items.size).toEqual(0)
        expect(messageCache.items.size).toEqual(msgs.length)
        expect(pinCache.items.size).toEqual(0)
        expect(membershipCache.items.size).toEqual(2)

        const { chatMessageIds, messages, members, admins, pinned } = res  
        expect(pinned.length).toEqual(0)
        expect(chatMessageIds[dm.id].length).toEqual(msgs.length)
        expect(Object.keys(messages).length).toEqual(msgs.length)
        expect(dm.id in members).toBeTruthy()
        expect(members[dm.id].length).toEqual(2)
        expect( Object.keys(admins).length ).toEqual(0)
    })


    it('togglePin', async() => {
        // setup db
        const [user1, user2, user3] = await utils.addRandomUsers(3)
        expect(user1).toBeDefined()
        expect(user2).toBeDefined()
        expect(user3).toBeDefined()

        const { chat: dm1 } = await utils.getDm(user1.id, user2.id)
        const { chat: dm2 } = await utils.getDm(user1.id, user3.id)
        expect(dm1).toBeDefined()
        expect(dm2).toBeDefined()

        const pin1 = await utils.createPin(user1.id, dm1.id)
        expect(pin1).toBeDefined()

        // create pin    
        let response = await controller.togglePin(user1.id, dm2.id)
        expect(response).toBeDefined()
        expect(response.chatId).toEqual(dm2.id)
        expect(response.pinned).toEqual(true)

        // check pinCache
        expect(pinCache).toBeDefined()
        expect(pinCache.items.size).toEqual(2)

        // check db
        let _pins = await db('pins').where({chatId: dm2.id, userId: user1.id}).select('*')
        expect(_pins).toBeDefined()
        expect(_pins.length).toEqual(1)

        // remove freshly created pin
        response = await controller.togglePin(user1.id, dm2.id)
        expect(response).toBeDefined() 
        expect(response.chatId).toEqual(dm2.id)
        expect(response.pinned).toBeFalsy()
        expect(pinCache.items.size).toEqual(1)

        // check db
        _pins = await db('pins').where({chatId: dm2.id, userId: user1.id}) 
        expect(_pins.length).toEqual(0)
    })

    it('post message: dm', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        const { chat } = await utils.getDm(user1.id, user2.id)
        const msgs = await utils.addRandomMessages(chat.id, 3)

        const req: MessagePostReq = {
            chatId: chat.id,
            content: faker.lorem.sentence()
        }

        const res = await controller.postMessage(user1.id, req)

        expect(res).toBeDefined()
        const [ res1, res2 ] = res        
        expect(res1).toBeDefined()
        expect(res2).toBeDefined()


        {
            const { users, chatInfo, target, targetId } = res1
            expect(user2.id in users).toBeTruthy()
            expect(chatInfo.name).toEqual(user2.username)
            expect(target).toEqual('user')
            expect(targetId).toEqual(user1.id)

        } 

        {
            const { users, chatInfo, target, targetId } = res2
            expect(user1.id in users).toBeTruthy()
            expect(chatInfo.name).toEqual(user1.username)
            expect(target).toEqual('user')
            expect(targetId).toEqual(user2.id)
        }

        {
            const {messageId, chatId, sender, content} = res1.message
            expect(sender).toEqual(user1.id)
            expect(content).toEqual(req.content)
            expect(chatId).toEqual(req.chatId)
            expect(messageCache.items.has(messageId)).toBeTruthy()
        }

        expect(messageCache.items.size).toEqual(msgs.length + 1)

        const _msgs = await messageCache.getMessageForChat(chat.id)  
        expect(_msgs.length).toEqual(messageCache.items.size)
    })    

    it('postMessage: group', async () => {
        const [user1, user2, user3] = await utils.addRandomUsers(3)
        const userIds = [user1, user2, user3].map(u => u.id)
        const { chat, info, memberships } = await utils.getGroup(userIds) 
        expect(chat).toBeDefined()
        expect(info).toBeDefined()
        expect(info.chatId).toEqual(chat.id)
        expect(memberships.length).toEqual(3)

        {
            const infoId = await db('chatinfo').where({id: info.id, chatId: chat.id})
            expect(infoId.length).toEqual(1)
        }

        const req: MessagePostReq = { chatId: chat.id, content: faker.lorem.sentence() }

        const res = await controller.postMessage(user1.id, req)
        expect(res).toBeDefined()
        expect(res.length).toEqual(1)

        const [{message, chatInfo, users, target, targetId}] = res
        expect(target).toEqual('group')
        expect(user1.id in users).toBeTruthy()
        expect(user2.id in users).toBeTruthy()
        expect(user3.id in users).toBeTruthy()
        expect(targetId).toEqual(chat.id)
        expect(message.chatId).toEqual(chat.id)
        expect(message.content).toEqual(req.content)
        expect(chatInfo.id).toEqual(chat.id)
        expect(chatInfo.isGroup).toBeTruthy() 

        {
            const msgs = await messageCache.getMessageForChat(chat.id)
            expect(msgs.length).toEqual(1)
        }          
    })

    it("handleChatWithUser: doesn't exist", async () => {
        const [user1, user2] = await utils.addRandomUsers(2)

        const res = await controller.handleChatWithUser(user1.id, user2.id)
        expect(res).toBeDefined()

        const { chatId, info, chatMessageIds, messages, members, admins } = res
        expect(chatId).toBeDefined()
        expect(info.name).toEqual(user2.username) 
        expect(info.id).toEqual(chatId)
        expect(Object.keys(messages).length).toEqual(0)
        expect(chatId in chatMessageIds).toBeTruthy()
        expect(chatMessageIds[chatId].length).toEqual(0)
        expect(members.length).toEqual(2) 
        expect(admins.length).toEqual(0)
    })
})



async function getDmId(user1: string, user2: string){
    const chatId = await db
        .with('user1m', db('memberships').where({userId: user1}))
        .with('user2m', db('memberships').where({userId: user2}))
        .with('joined',
            db('user1m')
            .innerJoin('user2m', "user1m.chatId", '=', "user2m.chatId")
            .select('user1m.chatId as id')
        )
        .select('joined.id').from('joined')
        .join('chats', 'chats.id', '=', 'joined.id')
        .where('isGroup', false)
    return chatId
}

const isValidUuidV4 = (str: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
};
