import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import db from './config/db'
import { httpServer } from "./socketServer";
import app from './app'

import { io as ioc, type Socket as ClientSocket } from 'socket.io-client'
import request from "supertest"
import { wait } from "shared/src/utils";
import { Commands } from "shared/src/MiddlewareCommands";
import { UserInfoCollection } from "shared/src/UserInfo";
import { faker } from "@faker-js/faker/.";
import { Message } from "./models/models";

describe('socketServer', () => {

    let user1: ReturnType<typeof getClient>
    let user2: ReturnType<typeof getClient>

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()


        user1 = getClient('user1')
        httpServer.listen(5000)


    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    afterAll(async() => {
        user1.close()
        httpServer.close()
        
        await db.migrate.rollback()
    })

    it('try login', async () => {
        const {id, username, token} = await user1.login('user1', 'password')
        expect(id).toBeDefined() 
        expect(username).toBeDefined()
        expect(token).toBeDefined()
        expect(user1.getToken()).toBeDefined()
    }) 

    it('starting socket server', async () => {
        user1.startSocket()
        const socket = user1.getSocket()
        await waitFor(() => socket.connected)
    })

    it('user1: requesting users', async () => {
        user1.requestUsers() 
        await waitFor(() => Object.keys(user1.getResponses().users).length > 0)

        const users = user1.getResponses().users!
        const [ user2 ] = Object.values(users)
        expect(user2).toBeDefined()
        const { id, name, iconSrc } = user2
        expect(id).toBeDefined()
        expect(name).toEqual('user2')
        expect(iconSrc).toBeDefined()
    }) 

    it('user1 requesting init loading', async () => {
        user1.initLoading()
        await waitFor(() => Object.keys(user1.getResponses().chatMessageIds).length > 0)

        const { chatInfo, chatMessageIds, messages, unseenCount, members, admins, pinned } = user1.getResponses()!
        expect(chatInfo).toBeDefined()
        expect(chatMessageIds).toBeDefined()
        expect(messages).toBeDefined()
        expect(unseenCount).toBeDefined()
        expect(members).toBeDefined()
        expect(admins).toBeDefined()
        expect(pinned).toBeDefined()

        expect(pinned.length).toEqual(0)
    })

    it('user1 searches for user3', async () => {
        user1.search('user3')
        await waitFor(() => Object.keys(user1.getResponses().search).length > 0 )
        const [ user3 ] = Object.values(user1.getResponses().search)
        expect(user3).toBeDefined()
        const { id, name, iconSrc } = user3
        expect(id).toBeDefined()
        expect(name).toEqual('user3')
        expect(iconSrc).toBeDefined()
    })

    it('user1 sends a message to user2', async () => {
        const { chatMessageIds } = user1.getResponses()
        const chatId = Object.keys(chatMessageIds)[0]
        const content = faker.lorem.sentence()
    
        const count = user1.messageCount()
        user1.postMessage(chatId, content)

        await waitFor(() => user1.messageCount() > count)

    })

    it('user2 enters', async () => {
        user2 = getClient('user2')

        await user2.login('user2', 'password')
        user2.startSocket()
        await waitFor(() => user2.getSocket().connected)

        user2.requestUsers()
        user2.initLoading()

        await waitFor(() => user2.userCount() > 0)
        await waitFor(() => user2.messageCount() > 0)
    })

    it('user2 sends message to user1 and both receive the response', async () => {
        const chatId = Object.keys(user1.getResponses().chatMessageIds)[0]
        const content = faker.lorem.sentence()
        const count1 = user1.messageCount()
        const count2 = user2.messageCount()

        // console.log('user2 sends message to ', chatId)
        user2.postMessage(chatId, content)

        // await waitFor(() => user1.messageCount() > count1)
        await Promise.all([
            waitFor(() => user2.messageCount() > count2),
            waitFor(() => user1.messageCount() > count1)
        ])
    })

    it('user1 requests chat with user3', async () => {
        const [ user3 ] = Object.values(user1.getResponses().search)
        expect(user3).toBeDefined()
        expect(user3.name).toEqual('user3')

        const count = user1.getCount()
        const chatCount = user1.getChatCount()

        user1.reqChatWith(user3.id)

        await waitFor(() => user1.getCount() > count)
        expect(user1.getChatCount() > chatCount).toBeTruthy()

    })

    it('sanity', () => expect(true).toBeTruthy())
})

function getClient(name: string){
    const _name = name
    let count = 0
    let token: string
    const getToken = () => token
    let responses = {
        users: {} as UserInfoCollection,
        search: {} as UserInfoCollection,
        chatMessageIds: {} as { [P: string]: string[]},
        messages: {} as { [P: string]: Message},
        chatInfo: {} as { [P: string]: {name: string, iconSrc: string, status: string, isGroup: boolean}},
        admins: {} as { [P: string]: string[]},
        members: {} as { [P: string]: string[]},
        unseenCount: {},
        pinned: [] as string[]
    }

    let clientSocket: ClientSocket

    const getSocket = () => clientSocket
    const getResponses = () => responses
    const getCount = () => count

    const login = async (username: string, password: string) => {
        const url = '/api/user/login'
        const res = await request(httpServer)
            .post(url)
            .send({username, password})
        const data = res.body

        token = data.token
        return data
    } 

    const startSocket = () => {
        clientSocket = ioc('http://localhost:5000', {auth: {token}})

        clientSocket.on(Commands.UsersResponse, data => { 
            count += 1
            responses.users = data 
        })
        clientSocket.on(Commands.InitLoadingResponse, data => { 
            count += 1
            responses = {...responses, ...data}
        })
        clientSocket.on(Commands.SearchRes, data => { 
            count += 1
            responses.search = data 
        })
        clientSocket.on(Commands.MessagePostRes, (msg: Message) => {
            count += 1
            responses.messages[msg.id] = msg
            if(!(msg.chatId in responses.chatMessageIds)){
                responses.chatMessageIds[msg.chatId] = []
            }
            responses.chatMessageIds[msg.chatId].unshift(msg.id)
        })
        clientSocket.on(Commands.ChatWithUserRes, (data) => {
            count += 1
            const { chatId, info, members, admins, messages, chatMessageIds } = data
            responses.chatInfo[chatId] = info as {name: string, iconSrc: string, status: string, isGroup: boolean}
            responses.chatMessageIds[chatId] = chatMessageIds[chatId]
            responses.members[chatId] = members[chatId]
            responses.admins[chatId] = admins[chatId]
            responses.messages = {...responses.messages, ...messages}
        })
    }

    const close = () => clientSocket.close()

    const messageCount = () => Object.keys(responses.messages).length
    const userCount = () => Object.keys(responses.users).length
    const getChatCount = () => Object.keys(responses.chatMessageIds).length

    const requestUsers = () => {
        clientSocket.emit(Commands.UsersRequest, '')
    }

    const initLoading = () => {
        clientSocket.emit(Commands.InitLoadingRequest, '')
    }

    const search = (term: string) => {
        clientSocket.emit(Commands.SearchReq, term)
    }

    const postMessage = (chatId: string, content: string) => {
        clientSocket.emit(Commands.MessagePostReq, {chatId, content})
    }

    const reqChatWith = (userId: string) => {
        clientSocket.emit(Commands.ChatWithUserReq, userId)
    }

    return { 
        login, getToken, startSocket, close, getSocket, getCount, getChatCount,
        requestUsers, initLoading, search, postMessage, reqChatWith,
        getResponses, messageCount, userCount
    }
}

function waitFor(cond: () => boolean){
    return new Promise((res, rej) => {
        let count = 10
        const interval = setInterval(() => {
            if(count > 0 && cond()){
                clearInterval(interval)
                res(true)
            }
            else if(count <= 0){
                clearInterval(interval)
                rej()
                expect(cond()).toBeTruthy()
            }
            count -= 1
        }, 100)
    })
}