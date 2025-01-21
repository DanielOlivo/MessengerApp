process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll, afterEach, beforeEach} from '@jest/globals'
import {io as ioc, type Socket as ClientSocket} from 'socket.io-client'
import db from '../config/db'
import app from '../app'
import request from 'supertest'
import {io, httpServer} from '../socketServer'
import { AddressInfo } from 'net'
import { Chats, ChatId, Message, SearchResult, 
    TokenPayload, DM, Group, Membership, DMPosted, 
    DMPostReq, MessageReadReq,
    MessageReadRes} from '../types/Types'

// just to organize all socket tests in one place
type TestCases = {[name: string]: () => Promise<void>}
type TestList = { 
    "001 user1.getChats - chatsRes (check he gets none)": () => Promise<void>
    "002 user1.search 'user' - searchResult [user2, user3]": () => Promise<void>
    "003 user1.getDm user2.id - dmRes (dm.id)": () => Promise<void>

    "010 user1.sendDm user2.id 'hey' - dmPosted with (dm, Message) for both": () => Promise<void>
    "011 user1.msgRead msg.id - readNotRes (with unread) (for both)": () => Promise<void>
    "012 user2.msgRead msg.id - readNotRes (with unread) (for both)": () => Promise<void>

    "020 user2.typesDm chatId - userTypes (with user2) (for both)": () => Promise<void>
    "021 user2.sendDm user1.id 'whats up' - dmPosted with (dm, Message) for both": () => Promise<void>
    "022 user2.msgRead msg.id - readNotRes (with unread) (for both)": () => Promise<void>
    "023 user1.msgRead msg.id - readNotRes (with unread) (for both)": () => Promise<void>

    "030 user2 discconnets (check client status)": () => Promise<void>
    "031 user1.sendDm user2.id 'where are you?'  - dmPosted (for user1)": () => Promise<void>
    "032 user1.msgRead msg.id - readNotRes (with unrea) (for user1)": () => Promise<void>
    "033 user2 reconnects (check the status)": () => Promise<void>
    "034 user2.getChats  - chatsRes (1 dm) (for user2)": () => Promise<void>
    "035 user2.getUnread - unreadRes (1 msg) (for user2)": () => Promise<void>
    "036 user2.getDmMsg dm.id - msgList (3 msgs) (for user2)": () => Promise<void>
    "037 user2.msgRead msg.id - unreadres (with unread) (for both)": () => Promise<void>


    "040 user1.createGroup 'boys' - groupCreated (with group, membership) (for user1)": () => Promise<void>
    "041 user1.sendGM chatid 'hi' - gmPosted (group, message) (for group)": () => Promise<void>
    "042 user1.msgRead msg.id - readNotRes (unread) (for group)": () => Promise<void>

    "050 user1.addMember user2.id - memberAdded (group membership) (to group, user2 included)": () => Promise<void>
    "051 user2.getGmMsg group.id - msgList (0 msg) (for user2)": () => Promise<void>
}


type Client = {
    socket: ClientSocket
    tokenPayload: TokenPayload
    ping: (arg: string) => void
    chatsRes: (arg: {groups: Group[], dms: DM[]}) => void
    searchResult: (res: SearchResult) => void
    dmRes: (dm: DM) => void
    dmPosted: (arg: DMPosted) => void
    messageReadRes: (arg: MessageReadRes) => void     

    dm: (msg: Message) => void
    groupAdded: (arg: {group: Group, membership: Membership}) => void
    // groupAdded: (group: Group, membership: Membership) => void
}


describe("socket interactions", () => {

    let client: Client
    let user1: Client
    let user2: Client
    let user3: Client
    let dudes: Group

    let dm12: DM;
    let msg: Message;

    const tests: TestList = {
        "001 user1.getChats - chatsRes (check he gets none)": async () => {
            await waitWith((done) => {
                user1.chatsRes = ({groups, dms}: Chats) => {
                    expect(groups).toBeDefined()
                    expect(dms).toBeDefined()
                    expect(groups.length).toEqual(0)
                    expect(dms.length).toEqual(0)
                    done()
                }
            }, () => {
                user1.socket.emit('getChats', '')
            })
        },

        "002 user1.search 'user' - searchResult [user2, user3]": async () => {
            await waitWith((done) => {
                user1.searchResult = ({users, groups}: SearchResult) => {
                    expect(users).toBeDefined() 
                    expect(users.length).toEqual(2)
                    expect(users.map(user => user.username).includes('user2')).toBeTruthy()
                    expect(users.map(user => user.username).includes('user3')).toBeTruthy()
                    expect(users.map(user => user.username).includes('user1')).toBeFalsy()
                    expect(groups).toBeDefined()
                    expect(groups.length).toEqual(0)
                    done()
                }
            }, () => {
                user1.socket.emit('search', 'user')
            }, 10)
        },

        '003 user1.getDm user2.id - dmRes (dm.id)': async() => {
            await waitWith((done) => {
                user1.dmRes = (dm) => {
                    expect(dm).toBeDefined()
                    expect(dm.user1Id).toEqual(user1.tokenPayload.id)
                    expect(dm.user2Id).toEqual(user2.tokenPayload.id)
                    dm12 = dm
                    done()
                } 
            }, () => {
                user1.socket.emit('getDm', user2.tokenPayload.id)
            })
        },

        '010 user1.sendDm user2.id \'hey\' - dmPosted with (dm, Message) for both': async() => {
            await waitWith(async (done) => {
                const [msg1, msg2] = await Promise.all([
                    waitForDm(user1),
                    waitForDm(user2)
                ])
                expect(msg1).toBeDefined()    
                expect(msg2).toBeDefined()
                expect(msg1.dm.user1Id).toEqual(user1.tokenPayload.id)
                expect(msg1.dm.user2Id).toEqual(user2.tokenPayload.id)
                expect(msg1.message.userId).toEqual(user1.tokenPayload.id)
                expect(msg1.message.content).toEqual('hey')
                msg = msg1.message
                done()

            }, () => {
                const req: DMPostReq = {userId: user2.tokenPayload.id, content: 'hey'}
                user1.socket.emit('sendDm', req)
            })
        },

        '011 user1.msgRead msg.id - readNotRes (with unread) (for both)': async() =>  {
            await waitWith(async (done) => {
                const [res1, res2] = await Promise.all([
                    waitForReadRes(user1),
                    waitForReadRes(user2)
                    // wait(10)
                ])
                expect(res1).toBeDefined()
                expect(res2).toBeDefined()
                expect(res1.userId).toEqual(user1.tokenPayload.id)

                done()
            }, () => {
                const req: MessageReadReq = {message: msg}
                user1.socket.emit('msgRead', req)
            })
        },
        '012 user2.msgRead msg.id - readNotRes (with unread) (for both)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '020 user2.typesDm chatId - userTypes (with user2) (for both)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '021 user2.sendDm user1.id \'whats up\' - dmPosted with (dm, Message) for both': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '022 user2.msgRead msg.id - readNotRes (with unread) (for both)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '023 user1.msgRead msg.id - readNotRes (with unread) (for both)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '030 user2 discconnets (check client status)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '031 user1.sendDm user2.id \'where are you?\'  - dmPosted (for user1)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '032 user1.msgRead msg.id - readNotRes (with unrea) (for user1)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '033 user2 reconnects (check the status)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '034 user2.getChats  - chatsRes (1 dm) (for user2)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '035 user2.getUnread - unreadRes (1 msg) (for user2)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '036 user2.getDmMsg dm.id - msgList (3 msgs) (for user2)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '037 user2.msgRead msg.id - unreadres (with unread) (for both)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '040 user1.createGroup \'boys\' - groupCreated (with group, membership) (for user1)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '041 user1.sendGM chatid \'hi\' - gmPosted (group, message) (for group)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '042 user1.msgRead msg.id - readNotRes (unread) (for group)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '050 user1.addMember user2.id - memberAdded (group membership) (to group, user2 included)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        },
        '051 user2.getGmMsg group.id - msgList (0 msg) (for user2)': function (): Promise<void> {
            throw new Error('Function not implemented.')
        }
    }

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()

        let port;
        httpServer.listen(() => {
            const address = httpServer.address() as AddressInfo
            port = address.port
        })

        await wait(300)
        client = await getClient('john.doe', 'password', port!)
        user1 = await getClient('user1','password', port!)
        user2 = await getClient('user2','password', port!)
        user3 = await getClient('user3','password', port!)

        await wait(300)
    })

    beforeEach(() => {
        const users = [client, user1, user2, user3]
        users.forEach(cli => {
            cli.ping = (arg) => {}
            cli.searchResult = (res) => {}
            cli.dm = (msg) => {}
        });
    })

    afterAll(async() => {
        client.socket.disconnect()
        user1.socket.disconnect()
        user2.socket.disconnect()
        user3.socket.disconnect()
        io.close()

        await db.migrate.rollback()
    })

    test('ping', async () => {
        await waitWith((done) => {
            client.ping = arg => {
                expect(arg).toEqual('message')
                done()
            }
        }, () => {
            client.socket.emit('ping', 'message')
        }, 100)
    })

    const cases = Object.keys(tests)
    cases.sort()
    // console.log(cases.slice(0, 1))

    cases.slice(0, 5).forEach((key) => {
        const k = key as keyof TestList
        // console.log(k)
        // console.log(tests[k])
        test(key, tests[k])
    })
    
    // test('user1 searches for user2', async() => {
    //     await waitWith((done) => {
    //         user1.searchResult = result => {
    //             expect(result.users.length).toEqual(2)
    //             expect(result.groups.length).toEqual(0)
    //             done()
    //         }
    //     }, () => {
    //         user1.socket.emit('search', 'user')
    //     })
    // })

    // test('user1 searches himself (gets none)', async() => {
    //     await waitWith((done) => {
    //         user1.searchResult = result => {
    //             expect(result.users.length).toEqual(0)
    //             expect(result.groups.length).toEqual(0)
    //             done()
    //         }
    //     }, () => {
    //         user1.socket.emit('search', 'user1')
    //     })
    // })

    // test('user1 sends dm to user2', async() => {
    //     await waitWith((done) => {
    //         user1.dm = msg => {
    //             expect(msg.userId).toEqual(user1.tokenPayload.id)
    //             expect(msg.content).toEqual('hey')
    //             done()
    //         }
    //     }, () => {
    //         user1.socket.emit('dm_user', user2.tokenPayload.id, 'hey')
    //     }, 10)
    // })

    // test('user2 receives dm from user1', async() => {
    //     await wait(100) // otherwise it may not work
    //     await waitWith((done) => {
    //         user1.dm = msg => {}
    //         user2.dm = msg => {
    //             expect(msg.content).toEqual('dude')
    //             done()
    //         }
    //     }, () => {
    //         user1.socket.emit('dm_user', user2.tokenPayload.id, 'dude')
    //     })
    // })

    // test('user2 sends dm to user1', async() => {
    //     await waitWith(async (done) => {
    //         const [msg1, msg2]: Message[] = await Promise.all([
    //             waitForDm(user1),
    //             waitForDm(user2)
    //         ])
    //         expect(msg1.userId).toEqual(user2.tokenPayload.id)
    //         expect(msg2.userId).toEqual(user2.tokenPayload.id)
    //         expect(msg1.content).toEqual('hello')
    //         expect(msg2.content).toEqual('hello')
    //         done()
    //     }, () => {
    //         user2.socket.emit('dm_user', user1.tokenPayload.id, 'hello')
    //     }, 10)
    // })

    // test("user3 doesn't receive dm between user1 and user2", async() => {
    //     await waitWith(async(done) => {
    //         const getUser12Msgs = () => Promise.all([
    //             waitForDm(user1),
    //             waitForDm(user2),
    //             wait(400) // just to give time for user3 just in case
    //         ])

    //         const getUser3Msg = () => waitForDm(user3)

    //         const result = await Promise.race([
    //             getUser12Msgs(),
    //             getUser3Msg()
    //         ])

    //         const [msg1, msg2, _] = result as [Message, Message, undefined]
    //         expect(msg1.userId).toEqual(user2.tokenPayload.id)
    //         expect(msg2.userId).toEqual(user2.tokenPayload.id)
    //         done()
    //     }, () => {
    //         user2.socket.emit('dm_user', user1.tokenPayload.id, "user3 doesn't hear us?")
    //     })
    // })

    // test('user1 creates group: dudes', async() => {
    //     await waitWith((done) => {
    //         user1.groupAdded = ({group, membership}) => {
    //             expect(group).toBeDefined()
    //             expect(membership).toBeDefined()
    //             expect(group.name).toEqual('dudes')
    //             expect(membership.userId).toEqual(user1.tokenPayload.id)
    //             expect(membership.groupId).toEqual(group.id)
    //             done()
    //         }
    //     }, () => {
    //         user1.socket.emit('groupNew', user1.tokenPayload.id, 'dudes')
    //     }, 10)
    // })

    test('sanity check', () => {
        expect(true).toBeTruthy()
    })

})

function wait(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

function waitWith(setup: (arg: any) => void, action: () => void, ms: number = 300): Promise<void>{
    return new Promise(res => {
        const done = () => res()
        setup(done)
        setTimeout(action, 300)
    })
}

async function getClient(username: string, password: string, port: number){
    const credentials = {username, password}
    let res = await request(app).post('/api/user/register').send(credentials)
    res = await request(app).post('/api/user/login').send(credentials)
    const tokenPayload = res.body as TokenPayload
    const token = res.body.token

    const user: Client = {
        socket: ioc("http://localhost:" + port, {auth: {token}}),
        tokenPayload,
        ping: (arg) => {},
        chatsRes: (arg) => {},
        searchResult: (arg) => {},
        dmRes: (arg) => {},
        dmPosted: (arg) => {},
        messageReadRes: (arg) => {},
            


        dm: (msg) => {},
        groupAdded: arg => {}
    }

    user.socket.on('ping', arg => user.ping(arg))
    user.socket.on('chatsRes', arg => user.chatsRes(arg))
    user.socket.on('search_result', (res: SearchResult) => user.searchResult(res))
    user.socket.on('dmRes', (dm: DM) => user.dmRes(dm))
    user.socket.on('dmPosted', arg => user.dmPosted(arg))
    user.socket.on('messageReadRes', arg => user.messageReadRes(arg))


    user.socket.on('dm', (msg: Message) => user.dm(msg))
    user.socket.on('groupAdded', arg => user.groupAdded(arg))

    return user
}

function waitForDm(client: Client): Promise<DMPosted>{
    return new Promise(res => {
        client.dmPosted = msg => {
            res(msg)
        }
    })
}

function waitForReadRes(client: Client): Promise<MessageReadRes> {
    return new Promise(resolve => {
        client.messageReadRes = res => {
            resolve(res)
        }
    })
}
