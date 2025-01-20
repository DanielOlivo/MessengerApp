import { Server } from 'socket.io'
import { createServer } from 'http'
import app from './app'
import { verifyToken } from './middlewares/socketAuth'

export const httpServer = createServer(app)
export const io = new Server(httpServer)

io.use(verifyToken)

io.on('connection', (socket) => {

    socket.on('ping', arg => {
        io.to(socket.id).emit('ping', arg)
    })

})