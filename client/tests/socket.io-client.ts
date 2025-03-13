import { Socket } from 'socket.io-client'
// @ts-expect-error Socket.IO shenanigans.
import { io } from 'socket.io-client/dist/socket.io.js'

export function createSocketClient(uri: string): Socket {
  return io(uri, { transports: ['websocket'] })
}