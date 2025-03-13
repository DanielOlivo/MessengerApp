/*
import { describe, test, expect } from 'vitest'
import {WebSocketInterceptor, type WebSocketData } from '@mswjs/interceptors/WebSocket'
import { Server } from 'socket.io'
import { HttpServer } from '@open-draft/test-server/http'
import { DeferredPromise } from '@open-draft/deferred-promise'
import { toSocketIo } from '@mswjs/socket.io-binding'

const interceptor = new WebSocketInterceptor()

const httpServer = new HttpServer()
const wsServer = new Server(httpServer['_http'])

function getWsUrl():string {
    const url = new URL(httpServer.http.address.href)
    url.protocol = url.protocol.replace('http', 'ws')
    return url.href
}

describe('socket test', () => {

    beforeAll(async() => {
        interceptor.apply()
        await httpServer.listen()
    })

    afterEach(() => {
        interceptor.removeAllListeners()
    })

    afterAll(async () => {
        interceptor.dispose()
        await httpServer.close()
    })

    test('intercepting', async () => {
        const { createSocketClient } = await import ('./socket.io-client.ts')

        const eventLog: Array<WebSocketData> = []
        const outgoingDataPromise = new DeferredPromise<WebSocketData>()

        interceptor.on('connection', (connection) => {
            connection.client.addEventListener('message', (event) => {
                eventLog.push(event.data)
            })

            const { client } = toSocketIo(connection)

            client.on('fetching', (data) => {
                outgoingDataPromise.resolve( data)
            })
        })

        const ws = createSocketClient('wss://example.com')
        ws.emit('some data')

        expect(await outgoingDataPromise).toBe('some data')

    })

    test('snity check', () => {
        expect(true).toBeTruthy()
    })
})
*/