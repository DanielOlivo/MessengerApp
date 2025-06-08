import db from './config/db'
import { Server } from 'socket.io'
import { createServer } from 'http'

// import logger from "@logger/logger"
import app from './app'
import { verifyToken } from './middlewares/socketAuth'
import { ChatId, MessagePostReq, TokenPayload, UserId } from '@shared/Types'
import Sockets from './controllers/sockets'

import { Commands } from '@shared/MiddlewareCommands'
import { controller as chatController} from './controllers/chatController'
import { GroupCreateReq } from '@shared/Group'


export const httpServer = createServer(app)
export const io = new Server(httpServer, {
    cors: {
        origin: [process.env.BASE_URL as string, "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
})
// logger.info("socket cors set")



// const sockets = new Sockets()

const userSockets = new Map<string, string>()


io.use(verifyToken)

io.on('connection', async (socket) => {

    userSockets.set(socket.data.id, socket.id)

    // console.log('connection', socket.id)

    const chatIds: {id: string}[] = await db('memberships').leftJoin('chats', 'chats.id', '=', 'memberships.chatId')
        .where({userId: socket.data.id})
        .select('chats.id')

    chatIds.forEach(id => {
        // console.log(socket.data.username, 'adding to room', id.id)
        socket.join(id.id)
    })

    // const childLogger = logger.child({user: socket.data})
    // childLogger.info("new connection")

    // const payload = socket.data

    // handle subscirptions 
    // const chatids = await socketController.getAllChatIds(socket.data)
    // chatids.forEach(({id}) => {
    //     childLogger.trace({user: socket.data, roomId: id}, 'joining')
    //     socket.join(id)
    // })


    socket.on(Commands.UsersRequest, async () => {
        const { id } = socket.data as TokenPayload
        const res = await chatController.handleUsersRequest(id)
        socket.emit(Commands.UsersResponse, res)
    })

    socket.on(Commands.InitLoadingRequest, async () => {
        const { id } = socket.data as TokenPayload
        const res = await chatController.handleInitLoading(id)
        // console.log('init loading', res)
        socket.emit(Commands.InitLoadingResponse, res)
    })  

    socket.on(Commands.SearchReq, async (term: string) => {
        const { id } = socket.data as TokenPayload
        const res = await chatController.handleSearch(id, term)
        socket.emit(Commands.SearchRes, res)
    })  

    socket.on(Commands.TogglePinReq, async (chatId: ChatId) => {
        const { id } = socket.data as TokenPayload
        const res = await chatController.togglePin(id, chatId)
        socket.emit(Commands.TogglePinRes, res)
    })

    socket.on(Commands.MessagePostReq, async (req: MessagePostReq) => {
        const { id } = socket.data as TokenPayload
        const responses= await chatController.postMessage(id, req)
        for(const res of responses){
            const { target, targetId } = res
            switch(target){
                case 'group': io.to(targetId).emit(Commands.MessagePostRes, res); break;
                case 'user': {
                    if(userSockets.has(targetId)){
                        io.to(userSockets.get(targetId)!).emit(Commands.MessagePostRes, res); break
                    }
                }
            } 
        }
    })

    socket.on(Commands.ChatWithUserReq, async (userId: UserId) => {
        const { id } = socket.data as TokenPayload
        const res = await chatController.handleChatWithUser(id, userId)
        socket.emit(Commands.ChatWithUserRes, res) 
    })  

    socket.on(Commands.GroupCreateReq, async(req: GroupCreateReq) => {
        const { id } = socket.data as TokenPayload
        const res = await chatController.handleGroupCreate(id, req)

        for(const member of res.members){
            if(userSockets.has(member)){
                const socket = io.sockets.sockets.get(userSockets.get(member)!)
                socket?.join(res.id)
            }
        }

        io.to(res.id).emit(Commands.GroupCreateRes, res)
    })

})