import type {Meta, StoryObj} from '@storybook/react'
import { Sender } from './Sender'
import { Provider } from '../../utils/Provider'
import { http, WebSocketHandler, ws } from 'msw'
import { toSocketIo } from '@mswjs/socket.io-binding'
import { WebSocketInterceptor } from '@mswjs/interceptors/WebSocket'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

const meta = {
  title: 'testing/sender',
  component: Sender,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Sender>

export default meta
type Story = StoryObj<typeof meta>

const baseUrl = 'wss://localhost:3000'

const chat = ws.link(baseUrl)
// console.log('chat',chat)
// const interceptor = new WebSocketInterceptor()


export const Primary: Story = {
    decorators: [
        (Story) => <Provider><Story /></Provider>
    ],
    parameters: {
        msw: {
            handlers: [
                // interceptor.on('connection', (connection) => {
                //     console.log('connection!!!')
                //     connection.client.addEventListener('message', (e: unknown) => {
                //         console.log(e)
                //     })
                //     const { client } = toSocketIo(connection)
                // })
                chat.addEventListener('connection', (connection) => {
                    // console.log('connect!!!', connection)
                    // const io = toSocketIo(connection)

                    // io.client.on('number',n => {
                    //     console.log('getting num ', n)
                    // })
                }),
                http.options('*', () => {
                    return new Response(null, {
                        status: 200,
                        headers: {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
                        'Access-Control-Allow-Headers': '*',
                        },
                    })
                })

                // interceptor.addEventListener
                // chat.addEventListener('connection', (connection) => {
                //     const io = toSocketIo(connection)
                // })
                // interceptor.on('connection', (connection) => {
                //     connection.client.addEventListener('number', (e) => {
                //         console.log(e.data)
                //     })

                //     const io = toSocketIo(connection)
                //     io.client.on('number', (e, m) => {
                //         console.log(m)
                //     })
                // })
                // chat.addEventListener('connection', (con) => {
                //     const io = toSocketIo(con)
                //     io.on('hello', (event, name) => {
                //         console.log('client sent hello:', name)
                //     })
                // })
            ]
        }
    }
}