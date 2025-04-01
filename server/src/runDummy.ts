import { createServer } from 'node:http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer)
httpServer.listen(3000,() => {
    io.on('connection', socket => {
        console.log('hi')
    })
})

