import { Server } from 'socket.io'
import { createServer } from 'http'
import app from './app'

export const httpServer = createServer(app)
export const io = new Server(httpServer)

