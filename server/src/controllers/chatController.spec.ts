process.env.NODE_ENV = 'test'

import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from '@jest/globals'
import db from '../config/db'
import { controller } from './chatController'
import { isMessage, User } from '../models/models'
import { chatMessages } from '../models/chat'
import { wait } from 'shared/src/utils'
import { MessagePostReq } from 'shared/src/Message'
import { faker } from '@faker-js/faker/.'

// maybe it would be way easier to create db in the beginning of test here
// instead referencing seed...

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

    it('extracting user1 straight from db', async () => {
        const [ user ] = await db('users').where({username: 'user1'}).select('*')
        user1 = user
        expect(user1).toBeDefined()
        expect(user1.username).toEqual('user1')
    })

    it('extracting user2', async () => {
        const [ user ] = await db('users').where({username: 'user2'}).select('*')
        user2 = user
        expect(user2).toBeDefined()
        expect(user2.username).toEqual('user2')
    })

    it('extracting user3', async () => {
        const user = await db('users').where({username: 'user3'}).first()
        expect(user).toBeDefined()
        user3 = user
    })

    it('chat controller: user1 requests for contacts', async () => {
        const result = await controller.handleUsersRequest(user1.id)          
        expect(result).toBeDefined()
        const users = Object.values(result)
        expect(users.length).toEqual(1) 

        const [ user ] = users
        expect(user.id).toEqual(user2.id)
    })

    it('searching for user3', async () => {
        const result = await controller.handleSearch(user1.id, 'user3')
        expect(result).toBeDefined()
        expect(user3.id in result).toBeTruthy()
        
    })


    it('handle init loading', async () => {
        const result = await controller.handleInitLoading(user1.id)
        expect(result).toBeDefined()

        const { chatInfo, chatMessageIds, messages, unseenCount, admins, pinned } = result
        expect(chatInfo).toBeDefined()
        expect(chatMessageIds).toBeDefined()
        expect(messages).toBeDefined()
        expect(unseenCount).toBeDefined()
        expect(admins).toBeDefined()
        expect(pinned).toBeDefined()

        expect(Object.keys(chatInfo).length).toEqual(0) // chat info only for groups
        expect(Object.keys(chatMessageIds).length).toEqual(1) // user1 has only chat (with user2) 
        for(const messageId of Object.values(Object.values(chatMessageIds)[0])){
            expect(messageId in messages).toBeTruthy() // chatMessageIds and messages object are consisten
        }
    })   

    it('pins table has zero records', async () => {
        const pins = await db('pins').select('*')
        expect(pins.length).toEqual(0)
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
        await wait(200)
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

        const message = await controller.postMessage(user1.id, req)
        expect(message).toBeDefined()
        expect(isMessage(message)).toBeTruthy()

        expect(isValidUuidV4(message.id)).toBeTruthy()
        expect(message.chatId).toEqual(chatId)
        expect(message.userId).toEqual(user1.id)
        expect(message.content).toEqual(req.content)

    }) 

    it('user1 requests chat with user3', async () => {
        const result = await controller.handleChatWithUser(user1.id, user3.id)
        expect(result).toBeDefined()
        console.log(result)
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
