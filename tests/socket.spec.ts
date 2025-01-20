process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import {io as ioc, type Socket as ClientSocket} from 'socket.io-client'
import db from '../config/db'
import app from '../app'
import request from 'supertest'
import {io, httpServer} from '../socketServer'
import { AddressInfo } from 'net'

describe("socket interactions", () => {

    let client: ClientSocket 
    let user1: ClientSocket
    let user2: ClientSocket
    let user3: ClientSocket

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

    afterAll(async() => {
        client.disconnect()
        io.close()

        await db.migrate.rollback()
    })

    test('ping', async () => {
        await waitWith((done) => {
            client.on('ping', arg => {
                expect(arg).toEqual('message')
                done()
            })
        }, () => {
            // console.log('emitting...')
            client.emit('ping', 'message')
        })
    })

    test('user1 searches for user2', async() => {
         
    })

    test('sanity check', () => {
        expect(true).toBeTruthy()
    })

})

function wait(ms: number) {
    return new Promise(res => setTimeout(res, ms))
}

function waitWith(setup: (arg: any) => void, action: () => void): Promise<void>{
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
    const token = res.body.token
    return ioc("http://localhost:" + port, {auth: {token}})
    
}