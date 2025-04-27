import { Server } from 'socket.io'
import { createServer } from 'http'

// import logger from "@logger/logger"
import app from './app'
import { verifyToken } from './middlewares/socketAuth'
import { ChatId, MessagePostReq, TokenPayload, UserId } from '@shared/Types'
import Sockets from './controllers/sockets'

import socketController from './controllers/socket'
import { ChatListItem, ChatListReq, ChatSelect, 
    ChatSelectRes, GroupInfoReq, GroupRemoveReq, 
    HeaderInfo, NewGroupReq, SearchReq, SendReq, 
    SendRes, Typing, UserInfoReq } from '@shared/Types'
import { Commands } from '@shared/MiddlewareCommands'
import { controller as chatController} from './controllers/chatController'
import { Message } from './models/models'


export const httpServer = createServer(app)
export const io = new Server(httpServer, {
    cors: {
        origin: [process.env.BASE_URL as string, "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
})
// logger.info("socket cors set")



const sockets = new Sockets()

export const Cmd = {
    SearchReq: 'schrq',
    SearchRes: 'schrs',
}

// FOR TESTING
io.use(verifyToken)

io.on('connection', async (socket) => {

    console.log('connection', socket.id)

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
        const message: Message = await chatController.postMessage(id, req)
        io.to(message.chatId).emit(Commands.MessagePostRes, message)
    })

    socket.on(Commands.ChatWithUserReq, async (userId: UserId) => {
        const { id } = socket.data as TokenPayload
        const res = await chatController.handleChatWithUser(id, userId)
        socket.emit(Commands.ChatWithUserRes, res) 
    })  

})