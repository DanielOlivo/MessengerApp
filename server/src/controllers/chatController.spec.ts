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
    })

    it('handleUsersRequest', async () => {
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

        const _msgs = await messageCache.getMessagesForUser(user1.id)  
        expect(_msgs.length).toEqual(messageCache.items.size)
    })    
})


describe('chat controller', () => {

    let user1: User
    let user2: User
    let user3: User

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()

    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    it('extracting users', async () => {
        const users = await userModel.searchByUsername('user')
        const [ u1, u2, u3 ] = ['user1', 'user2', 'user3'].map(name => users.find(u => u.username === name)!)
        user1 = u1
        user2 = u2
        user3 = u3
        expect([user1, user2, user3].every(u => u)).toBeTruthy()

        // extracting contacts for user1
        {
            const result = await controller.handleUsersRequest(user1.id)          
            expect(result).toBeDefined()
            const users = Object.values(result)
            expect(users.length).toEqual(1) 

            const [ user ] = users
            expect(user.id).toEqual(user2.id)
        }

        { // searching for user3
            const result = await controller.handleSearch(user1.id, 'user3')
            expect(result).toBeDefined()
            expect(user3.id in result).toBeTruthy()
            const { name } = result[user3.id]
            expect(name).toEqual('user3')
        }


        {
            const { 
                chatInfo,
                chatMessageIds,
                messages,
                members,
                admins,
                pinned
             } = await controller.handleInitLoading(user1.id)

             expect(chatInfo).toBeDefined()
             expect(chatMessageIds).toBeDefined()
             expect(messages).toBeDefined()
             expect(members).toBeDefined()
             expect(admins).toBeDefined()
             expect(pinned).toBeDefined()

            const keys = Object.keys(chatInfo)
            expect(keys.length).toEqual(1)
            const info = chatInfo[keys[0]]
            expect(info.name).toEqual('user2')
            expect(info.id).toEqual(keys[0])
        }


    })


    // it('chat controller: user1 requests for contacts', async () => {
    //     const result = await controller.handleUsersRequest(user1.id)          
    //     expect(result).toBeDefined()
    //     const users = Object.values(result)
    //     expect(users.length).toEqual(1) 

    //     const [ user ] = users
    //     expect(user.id).toEqual(user2.id)
    // })


    // it('searching for user3', async () => {
    //     const result = await controller.handleSearch(user1.id, 'user3')
    //     expect(result).toBeDefined()
    //     expect(user3.id in result).toBeTruthy()
    //     const { name } = result[user3.id]
    //     expect(name).toEqual('user3')
    // })

    it('handleInitLoading: chatInfo', async () => {
        const { chatInfo } = await controller.handleInitLoading(user1.id)

        const keys = Object.keys(chatInfo)
        expect(keys.length).toEqual(1)
        const info = chatInfo[keys[0]]
        expect(info.name).toEqual('user2')
        expect(info.id).toEqual(keys[0])
    })

    it('handleInitLoading: chatMessageIds (should be 10)', async () => {
        const { chatMessageIds } = await controller.handleInitLoading(user1.id)
        const keys = Object.keys(chatMessageIds)
        expect(keys.length).toEqual(1)
        expect(chatMessageIds[keys[0]].length).toEqual(10)
    })

    it('handleInitLoading: chatInfo and chatmessageIds have same keys', async () => {
        const { chatMessageIds, chatInfo } = await controller.handleInitLoading(user1.id)
        expect(Object.keys(chatMessageIds).length).toEqual(Object.keys(chatInfo).length)
    })

    it('handleInitLoading: messages (should be 10)', async () => {
        const { messages } = await controller.handleInitLoading(user1.id)
        const keys = Object.keys(messages)
        expect(keys.length).toEqual(10)

        const msgs = Object.values(messages).sort((a, b) => a.timestamp > b.timestamp ? 1 : -1)
        const half1 = msgs.filter((m, i) => i % 2 === 0)
        const half2 = msgs.filter((m, i) => i % 2 !== 0)

        const userIds1 = Array.from( new Set( half1.map(m => m.userId) ) )
        const userIds2 = Array.from( new Set( half2.map(m => m.userId) ) )

        expect(userIds1.length).toEqual(1)
        expect(userIds2.length).toEqual(1)
        expect(userIds1[0]).not.toEqual(userIds2[0])
    })

    it('pins table has zero records', async () => {
        const pins = await db('pins').select('*')
        expect(pins.length).toEqual(0)
    })

    it('handleInitLoading: pinned', async () => {
        const { pinned } = await controller.handleInitLoading(user1.id) 
        expect(pinned).toBeDefined()
        expect(pinned.length).toEqual(0)
    })

    it('user1 toggles a chat', async () => {
        const [ {id: chatId} ] = await getDmId(user1.id, user2.id)
        expect(isValidUuidV4(chatId)).toBeTruthy()
        const result = await controller.togglePin(user1.id, chatId) 
        expect(result).toBeDefined()
        
        const { chatId: cid, pinned } = result
        expect(cid).toEqual(chatId)
        expect(pinned).toBeTruthy() 
    }) 

    it('db has one record', async () => {
        await wait(100)
        const pins = await db('pins').select('*')
        expect(pins.length).toEqual(1)
    })

    it('user1 toggles the chat again', async () => {
        const [ {id: chatId} ] = await getDmId(user1.id, user2.id)
        expect(isValidUuidV4(chatId)).toBeTruthy()
        const result = await controller.togglePin(user1.id, chatId) 
        expect(result).toBeDefined()
        
        const { chatId: id, pinned } = result
        expect(id).toEqual(chatId)
        expect(pinned).toBeFalsy()
    }) 

    it('user 1 sends  a message to chat with user2', async () => {
        const [ {id: chatId} ] = await getDmId(user1.id, user2.id)
        expect(isValidUuidV4(chatId)).toBeTruthy()

        const req: MessagePostReq = { chatId, content: faker.lorem.sentence() }  

        const responses = await controller.postMessage(user1.id, req)

        expect(responses.every(r => r.target === 'user')).toBeTruthy()

        const res1 = responses[0].targetId === user1.id ? responses[0] : responses[1]
        const res2 = responses[0].targetId === user2.id ? responses[0] : responses[1]

        {
            const { message, chatInfo, users } = res1
            expect(message).toBeDefined()
            expect(isMessage(message)).toBeTruthy()

            expect(isValidUuidV4(message.messageId)).toBeTruthy()
            expect(message.chatId).toEqual(chatId)
            expect(message.sender).toEqual(user1.id)
            expect(message.content).toEqual(req.content)

            expect(user1.id in users).toBeTruthy()
            expect(user2.id in users).toBeTruthy()

            expect(chatInfo.name).toEqual('user2')
        }

        {
            const { chatInfo } = res2
            expect(chatInfo.name).toEqual('user1')
        }
        
    }) 

    it('user1: initLoading again, chatMessageIds', async () => {
        const { chatMessageIds } = await controller.handleInitLoading(user1.id)
        const [ chatId ] = Object.keys(chatMessageIds)
        expect(chatId).toBeDefined()
        const [ msgIds ] = Object.values(chatMessageIds) 
        expect(msgIds.length).toEqual(11)
    }) 

    it('user1: initLoading again, messages', async () => {
        const { messages } = await controller.handleInitLoading(user1.id)
        const msgs = Object.values(messages)
        expect(msgs.length).toEqual(11)
    })

    it('user2 has two memberships', async () => {
        const mems = await db('memberships').where({userId: user2.id})
        expect(mems.length).toEqual(2)
    })

    it('user2: initLoading', async () => {
        const [ { id: chat12 } ] = await getDmId(user1.id, user2.id)         
        const [ { id: chat23 } ] = await getDmId(user2.id, user3.id)
        expect(chat12).toBeDefined()
        expect(chat23).toBeDefined()

        const { messages, chatMessageIds, chatInfo } = await controller.handleInitLoading(user2.id)
        expect(chat12 in chatMessageIds).toBeTruthy()
        expect(chat23 in chatMessageIds).toBeTruthy()
        expect(chatMessageIds[chat12].length).toEqual(11)
        expect(chatMessageIds[chat23].length).toEqual(10)
        expect(Object.keys(messages).length).toEqual(21)

        expect(chat12 in chatInfo).toBeTruthy()
        expect(chat23 in chatInfo).toBeTruthy()
        expect(chatInfo[chat12].name).toEqual('user1')
        expect(chatInfo[chat23].name).toEqual('user3')

        expect(Object.keys(chatMessageIds).length).toEqual(Object.keys(chatInfo).length)
    })

    it('user1 requests chat with user3', async () => {
        const result1 = await controller.handleChatWithUser(user1.id, user3.id)
        expect(result1).toBeDefined()

        // again
        const result2 = await controller.handleChatWithUser(user1.id, user3.id)
        expect(result2).toBeDefined()

        expect(result1.chatId).toEqual(result2.chatId)
        const { info: { name }} = result1
        expect(name).toEqual('user3')
        expect(name).toEqual(result2.info.name)
        expect(Object.keys(result1.messages).length).toEqual(0)
        expect(Object.keys(result1.chatMessageIds).length).toEqual(1)
    })

    it('user1 sends a message to user3', async () => {
        const { chatId } = await controller.handleChatWithUser(user1.id, user3.id) 
        expect(chatId).toBeDefined()
        expect(isValidUuidV4(chatId)).toBeTruthy()

        const req: MessagePostReq = { content: faker.lorem.sentence(), chatId }
        const responses = await controller.postMessage(user1.id, req)

        const res1 = responses.find(r => r.targetId === user1.id)!
        const res2 = responses.find(r => r.targetId === user3.id)!

        {
            const { message, chatInfo, users, targetId } = res1
            expect(isMessage(message)).toBeTruthy()
            expect(message.chatId).toEqual(chatId)
            expect(message.content).toEqual(req.content)
            expect(chatInfo.name).toEqual('user3')
            expect([user1.id, user3.id].every(n => n in users)).toBeTruthy()
            expect(targetId).toEqual(user1.id)
        }

        {
            const { chatInfo, targetId } = res2
            expect(chatInfo.name).toEqual('user1')
            expect(targetId).toEqual(user3.id)
        }
    })

    it('user3 initLoading', async () => {
        const [{ id: chatId }] = await getDmId(user1.id, user3.id)
        const { chatInfo, chatMessageIds, messages } = await controller.handleInitLoading(user3.id)
        expect(chatInfo).toBeDefined()
        expect(Object.keys(chatInfo).length).toEqual(3)
        expect(chatId in chatInfo).toBeTruthy()
        expect(chatMessageIds[chatId].length).toEqual(1)
        expect(Object.keys(messages).length).toEqual(21)

        expect(Object.keys(chatInfo).length).toEqual(Object.keys(chatMessageIds).length)
    })

     
    it('user1 creates groups with user2 and user3', async () => {
          
    })

    it('sanity', () => expect(true).toBeTruthy()) 


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
