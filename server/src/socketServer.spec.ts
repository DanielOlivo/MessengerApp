import { describe, it, expect, beforeAll, afterAll, afterEach, jest, beforeEach } from "@jest/globals";
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

import { DbUtils } from "./utils/db";
import { 
    userCache,
    pinCache,
    messageCache,
    chatCache,
    chatInfoCache,
    membershipCache
} from './controllers/chatController'
import { Client, waitFor as waitFor2 } from "./utils/clientSocket";
import { MessagePostReq } from "@shared/Message";
import { GroupCreateReq } from "@shared/Group";


describe('socketServer', () => {

    const utils = new DbUtils()

    let user1: ReturnType<typeof getClient>
    let user2: ReturnType<typeof getClient>

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        // await db.seed.run()


        // user1 = getClient('user1')
        // httpServer.listen(5000)


    })

    beforeEach(async() => {
        await utils.clean() 

        userCache.reset()
        chatCache.reset()
        chatInfoCache.reset()
        messageCache.reset()
        membershipCache.reset()
        pinCache.reset()

        httpServer.listen(5000)
        
    })

    afterEach(() => {
        Client.reset()
        jest.clearAllMocks()
        httpServer.close()
    })

    afterAll(async() => {
        // user1.close()
        // httpServer.close()
        
        await db.migrate.rollback()
    })

    it('test waitFor: success', async () => {
        await waitFor2(1000, async (done) => {
            await wait(10)
            expect(true).toBeTruthy()
            done()
        })
    })

    it('connect', async () => {
        const [ user1 ] = await utils.addRandomUsers(1)
        const client = new Client(user1)
        await waitFor2(10000, async(done) => {
            client.socket.on('connect', () => {
                expect(true).toBeTruthy()
                done()
            })
            client.socket.connect()
        })
    }) 

    it('handleUsersRequest', async () => {
        const [user1, user2, user3] = await utils.addRandomUsers(3)
        await utils.getDm(user1.id, user2.id)
        await utils.getDm(user1.id, user3.id)

        const client = new Client(user1)

        await waitFor2(1000, async(done) => {

            client.socket.on(Commands.UsersResponse, res => {
                expect(res).toBeDefined()
                expect(user2.id in res).toBeTruthy()
                expect(user3.id in res).toBeTruthy()
                done()
            })

            client.socket.connect()
            await wait(100)
            expect(client.socket.connected).toBeTruthy()
            client.socket.emit(Commands.UsersRequest, '')
        })
    })

    it('handleSearch', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        
        const client = new Client(user1)

        await waitFor2(1000, async (done) => {
            client.socket.on(Commands.SearchRes, res => {
                expect(res).toBeDefined() 
                expect(user2.id in res).toBeTruthy()
                expect(res[user2.id].name).toEqual(user2.username)
                done()
            })
            client.socket.connect()
            await wait(100)
            expect(client.socket.connected).toBeTruthy()
            client.socket.emit(Commands.SearchReq, user2.username)
        })
    }) 

    it('handleInitLoading', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        const { chat } = await utils.getDm(user1.id, user2.id)
        const msgs = await utils.addRandomMessages(chat.id)

        const client = new Client(user1)

        await waitFor2(1000, async(done) => {
            client.socket.on(Commands.InitLoadingResponse, res => {
                expect(res).toBeDefined()
                done()
            })

            client.socket.connect()
            await wait(100) 
            client.socket.emit(Commands.InitLoadingRequest, '')
        })
    })

    it('togglePin', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        expect(user1).toBeDefined()
        expect(user2).toBeDefined()
        const { chat } = await utils.getDm(user1.id, user2.id)
        expect(chat).toBeDefined()

        const client = new Client(user1)

        await waitFor2(1000, async(done) => {
            client.socket.on(Commands.TogglePinRes, res => {
                expect(res).toBeDefined()
                expect(res.pinned).toBeTruthy()
                expect(res.chatId).toEqual(chat.id)
                done()
            })
            client.socket.connect()
            await wait(100)
            client.socket.emit(Commands.TogglePinReq, chat.id)
        })
    })

    it('postMessage: other is offline', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        const { chat } = await utils.getDm(user1.id, user2.id)

        const client = new Client(user1)

        const req: MessagePostReq = {
            chatId: chat.id,
            content: faker.lorem.sentence()
        }

        await waitFor2(1000, async(done) => {
            client.socket.on(Commands.MessagePostRes, res => {
                expect(res).toBeDefined()
                expect(res.targetId).toEqual(user1.id)
                expect(res.target).toEqual('user')
                expect(res.message.content).toEqual(req.content)
                done()
            })
            client.socket.connect()
            await wait(100)
            client.socket.emit(Commands.MessagePostReq, req)
        })
    })

    it('postMessage: dm, other is online', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        const { chat } = await utils.getDm(user1.id, user2.id)

        const client1 = new Client(user1)
        const client2 = new Client(user2)

        const req: MessagePostReq = {
            chatId: chat.id,
            content: faker.lorem.sentence()
        }

        await waitFor2(10000, async(done) => {
            client1.socket.on(Commands.MessagePostRes, res => {
                expect(res).toBeDefined()
                expect(res.targetId).toEqual(user1.id)
                expect(res.target).toEqual('user')
                expect(res.message.content).toEqual(req.content)
                done()
            })

            client2.socket.on(Commands.MessagePostRes, res => {
                expect(res).toBeDefined()
                expect(res.targetId).toEqual(user2.id)
                expect(res.target).toEqual('user')
                expect(res.message.content).toEqual(req.content)
                done()
            })

            client1.socket.connect()
            client2.socket.connect()

            await wait(100)
            client1.socket.emit(Commands.MessagePostReq, req)
        }, 2)
    })


    it('postMessage: group', async () => {
        const [user1, user2, user3] = await utils.addRandomUsers(3)
        const userIds = [user1, user2, user3].map(u => u.id)
        const { chat, info, memberships } = await utils.getGroup(userIds)
        const client1 = new Client(user1)
        const client2 = new Client(user2)
        const client3 = new Client(user3)

        client1.socket.connect()
        client2.socket.connect()
        client3.socket.connect()
        await wait(100)

        const req: MessagePostReq = { chatId: chat.id, content: faker.lorem.sentence() }


        await waitFor2(1000, async(done) => {

            const sockets = [client1.socket, client2.socket, client3.socket]
            for(const socket of sockets){
                socket.on(Commands.MessagePostRes, res => {
                    expect(res).toBeDefined()
                    expect(res.target).toEqual('group')
                    expect(res.message.content).toEqual(req.content)
                    done()
                })
            }

            client1.socket.emit(Commands.MessagePostReq, req)
        }, 3)
    }) 

    it('handleChatWithUser: non existing', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        const client = new Client(user1)
        client.socket.connect()
        await wait(100)

        await waitFor2(1000, async(done) => {
            client.socket.on(Commands.ChatWithUserRes, res => {
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

                done()
            })

            client.socket.emit(Commands.ChatWithUserReq, user2.id)
        })

    }) 

    it('handleGroupCreate', async () => {
        const [user1, user2, user3] = await utils.addRandomUsers(3)
        const client1 = new Client(user1)
        const client2 = new Client(user2)
        const client3 = new Client(user3)
        await wait(100)

        const req: GroupCreateReq = {
            name: faker.lorem.word(),
            members: [user1,user2,user3].map(u => u.id),
            admins: [user1.id]
        }

        await waitFor2(1000, async(done) => {
            for(const client of [client1, client2, client3]){
                client.socket.on(Commands.GroupCreateRes, res => {
                    expect(res).toBeDefined()
                    done()
                })
            }

            client1.socket.emit(Commands.GroupCreateReq, req)
        }, 3)
    })   

    // doesn't work well, todo later
    it('postMessage: dm, other is online, many messages', async () => {
        const [user1, user2] = await utils.addRandomUsers(2)
        const { chat } = await utils.getDm(user1.id, user2.id)

        const client1 = new Client(user1)
        const client2 = new Client(user2)

        expect(messageCache.items.size).toEqual(0)

        const messageCount = 10

        const reqs: MessagePostReq[] = Array.from({length: messageCount}, () => ({
            chatId: chat.id,
            content: faker.lorem.sentence()
        }))
        
        
        let count1 = 0
        let count2 = 0
        let emits = 0
        await waitFor2(3000, async (done) => {

            client1.socket.on(Commands.MessagePostRes, res => {
                expect(res).toBeDefined()
                count1 += 1
                done()
            })

            client2.socket.on(Commands.MessagePostRes, res => {
                expect(res).toBeDefined()
                count2 += 1
                done()
            })

            client1.socket.connect()
            client2.socket.connect()
            await wait(100)

            await Promise.all(
                reqs.map((req, i) => {
                    const socket = i % 2 === 0 ? client1.socket : client2.socket
                    socket.emit(Commands.MessagePostReq, req)
                    emits += 1
                })
            ) 
        }, messageCount)

        expect(emits).toEqual(messageCount)
        expect(count1 - count2).toEqual(0)

        expect(messageCache.items.size).toEqual(messageCount)
    })



    // it('waitFor: timeout', async () => {
    //     try{
    //         await waitFor2(100, async (done) => {
    //             await wait(1000)
    //             expect(false).toBeTruthy()
    //             done()
    //         })
    //         expect(false).toBeTruthy()
    //     }
    //     catch {
    //         expect(true).toBeTruthy()
    //     }
    // })

    // it('try login', async () => {
    //     const {id, username, token} = await user1.login('user1', 'password')
    //     expect(id).toBeDefined() 
    //     expect(username).toBeDefined()
    //     expect(token).toBeDefined()
    //     expect(user1.getToken()).toBeDefined()
    // }) 

    // it('starting socket server', async () => {
    //     user1.startSocket()
    //     const socket = user1.getSocket()
    //     await waitFor(() => socket.connected)
    // })

    // it('user1: requesting users', async () => {
    //     user1.requestUsers() 
    //     await waitFor(() => Object.keys(user1.getResponses().users).length > 0)

    //     const users = user1.getResponses().users!
    //     const [ user2 ] = Object.values(users)
    //     expect(user2).toBeDefined()
    //     const { id, name, iconSrc } = user2
    //     expect(id).toBeDefined()
    //     expect(name).toEqual('user2')
    //     expect(iconSrc).toBeDefined()
    // }) 

    // it('user1 requesting init loading', async () => {
    //     user1.initLoading()
    //     await waitFor(() => Object.keys(user1.getResponses().chatMessageIds).length > 0)

    //     const { chatInfo, chatMessageIds, messages, unseenCount, members, admins, pinned } = user1.getResponses()!
    //     expect(chatInfo).toBeDefined()
    //     expect(chatMessageIds).toBeDefined()
    //     expect(messages).toBeDefined()
    //     expect(unseenCount).toBeDefined()
    //     expect(members).toBeDefined()
    //     expect(admins).toBeDefined()
    //     expect(pinned).toBeDefined()

    //     expect(pinned.length).toEqual(0)
    // })

    // it('user1 searches for user3', async () => {
    //     user1.search('user3')
    //     await waitFor(() => Object.keys(user1.getResponses().search).length > 0 )
    //     const [ user3 ] = Object.values(user1.getResponses().search)
    //     expect(user3).toBeDefined()
    //     const { id, name, iconSrc } = user3
    //     expect(id).toBeDefined()
    //     expect(name).toEqual('user3')
    //     expect(iconSrc).toBeDefined()
    // })

    // it('user1 sends a message to user2', async () => {
    //     const { chatMessageIds } = user1.getResponses()
    //     const chatId = Object.keys(chatMessageIds)[0]
    //     const content = faker.lorem.sentence()
    
    //     const count = user1.messageCount()
    //     user1.postMessage(chatId, content)

    //     await waitFor(() => user1.messageCount() > count)

    // })

    // it('user2 enters', async () => {
    //     user2 = getClient('user2')

    //     await user2.login('user2', 'password')
    //     user2.startSocket()
    //     await waitFor(() => user2.getSocket().connected)

    //     user2.requestUsers()
    //     user2.initLoading()

    //     await waitFor(() => user2.userCount() > 0)
    //     await waitFor(() => user2.messageCount() > 0)
    // })

    // it('user2 sends message to user1 and both receive the response', async () => {
    //     const chatId = Object.keys(user1.getResponses().chatMessageIds)[0]
    //     const content = faker.lorem.sentence()
    //     const count1 = user1.messageCount()
    //     const count2 = user2.messageCount()

    //     // console.log('user2 sends message to ', chatId)
    //     user2.postMessage(chatId, content)

    //     // await waitFor(() => user1.messageCount() > count1)
    //     await Promise.all([
    //         waitFor(() => user2.messageCount() > count2),
    //         waitFor(() => user1.messageCount() > count1)
    //     ])
    // })

    // it('user1 requests chat with user3', async () => {
    //     const [ user3 ] = Object.values(user1.getResponses().search)
    //     expect(user3).toBeDefined()
    //     expect(user3.name).toEqual('user3')

    //     const count = user1.getCount()
    //     const chatCount = user1.getChatCount()

    //     user1.reqChatWith(user3.id)

    //     await waitFor(() => user1.getCount() > count)
    //     expect(user1.getChatCount() > chatCount).toBeTruthy()

    // })

    // it('sanity', () => expect(true).toBeTruthy())
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