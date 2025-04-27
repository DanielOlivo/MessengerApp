import { describe, it, expect, beforeAll, afterAll, afterEach, jest } from "@jest/globals";
import db from './config/db'
import { httpServer } from "./socketServer";
import app from './app'

import { io as ioc, type Socket as ClientSocket } from 'socket.io-client'
import request from "supertest"
import { wait } from "shared/src/utils";
import { Commands } from "shared/src/MiddlewareCommands";

describe('socketServer', () => {

    let user1: ReturnType<typeof getClient>

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()


        user1 = getClient()
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
        await waitFor(() => user1.getResponse() !== undefined)

        const users = user1.getResponse()!
        const [ user2 ] = Object.values(users)
        expect(user2).toBeDefined()
        const { id, name, iconSrc } = user2
        expect(id).toBeDefined()
        expect(name).toEqual('user2')
        expect(iconSrc).toBeDefined()
    }) 

    it('user1 requesting init loading', async () => {
        user1.initLoading()
        await waitFor(() => user1.getResponse() !== undefined)
    })

    it('sanity', () => expect(true).toBeTruthy())
})

function getClient(){
    let token: string
    const getToken = () => token
    let response: object | undefined = undefined

    let clientSocket: ClientSocket

    const getSocket = () => clientSocket
    const getResponse = () => response

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

        clientSocket.on(Commands.UsersResponse, data => { response = data })
        clientSocket.on(Commands.InitLoadingResponse, data => { response = data} )
    }

    const close = () => clientSocket.close()

    const requestUsers = () => {
        response = undefined
        clientSocket.emit(Commands.UsersRequest, '')
    }

    const initLoading = () => {
        response = undefined
        clientSocket.emit(Commands.InitLoadingRequest, '')
    }

    return { 
        login, getToken, startSocket, close, getSocket,
        requestUsers, initLoading,
        getResponse
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