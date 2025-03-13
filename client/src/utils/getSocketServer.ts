import { createServer } from 'http'
import { Server } from 'socket.io'

export function getSocketServer(){
    const httpServer = createServer()    
    const io = new Server(httpServer)
    httpServer.listen(3000) 
    return io
}