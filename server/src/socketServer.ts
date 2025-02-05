import { Server } from 'socket.io'
import { createServer } from 'http'

import logger from "@logger/logger"
import app from './app'
import { verifyToken } from './middlewares/socketAuth'
import userModel from '@models/users'
import groupModel from '@models/groups'
import messageModel from '@models/messages'
import dmModel from '@models/dms'
import unreadModel, {Unread} from './models/unread'
import { 
    Chats, TokenPayload, ChatId, 
    UserId, MessageId, SearchResult, DMPosted, 
    DMPostReq, MessageReadReq, 
    MessageReadRes,
    Message} from '@shared/Types'
import Sockets from './controllers/sockets'

import socketController from './controllers/socket'
import { Res } from './controllers/socket'
import { ChatListItem, ChatListReq, ChatSelect, 
    ChatSelectRes, GroupInfoReq, GroupRemoveReq, 
    HeaderInfo, NewGroupReq, SearchReq, SendReq, 
    SendRes, Typing, UserInfoReq } from '@shared/Types'
import { Commands } from '@shared/MiddlewareCommands'


export const httpServer = createServer(app)
export const io = new Server(httpServer, {
    cors: {
        origin: [process.env.BASE_URL as string, "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
})
logger.info("socket cors set")



const sockets = new Sockets()

export const Cmd = {
    SearchReq: 'schrq',
    SearchRes: 'schrs',
}

// FOR TESTING
io.use(verifyToken)

io.on('connection', async (socket) => {

    // console.log('new connection', socket.data)

    const childLogger = logger.child({user: socket.data})
    childLogger.info("new connection")

    const payload = socket.data

    // handle subscirptions 
    const chatids = await socketController.getAllChatIds(socket.data)
    chatids.forEach(({id}) => {
        childLogger.trace({user: socket.data, roomId: id}, 'joining')
        socket.join(id)
    })



    // for user
    socket.on(Commands.ChatListReq, async (req: ChatListReq) => {
        childLogger.info("ChatListReq") 
        const res: ChatListItem[] = await socketController.handleChatListReq(payload, req)
        childLogger.info(res, "ChatListReq")
        io.to(socket.id).emit(Commands.ChatListRes, res)
    })

    socket.on(Commands.ChatSelectionReq, async(req: ChatSelect) => {
        childLogger.info({chatId: req.chatId}, "ChatSelectionReq")
        const res: ChatSelectRes = await socketController.handleChatSelectionReq(payload, req)!
        childLogger.info(res, "ChatSelectionRes")
        io.to(socket.id).emit(Commands.ChatSelectionRes, res)
    })

    socket.on(Commands.ChatSelectionWithUser, async(req: UserId) => {
        childLogger.info({userId: req}, "ChatSelectionWithUser")
        const res: ChatSelectRes = await socketController.handleDmRequestByUserId(payload, req)!
        childLogger.info({res}, "handleDmRequestByUserId")
        socket.join(res.chatId)
        sockets.getSocket(req)?.join(res.chatId)
        childLogger.info({sender: socket.data, chatId: res.chatId}, "ChatSelectionWIthUser: emitting")
        io.to(socket.id).emit(Commands.ChatSelectionRes, res)
    })

    socket.on(Commands.ChatMsgReq, async(chatId: ChatId)  => {
        childLogger.info({user: socket.data, chatId}, "ChatMsgReq")
        const res = await socketController.handleChatMsgReq(payload, chatId)
        childLogger.info({res}, "ChatMsgRes")
        io.to(socket.id).emit(Commands.ChatMsgRes, res)
    })

    socket.on(Commands.SearchReq, async(req: SearchReq) => {
        childLogger.info({req, user: socket.data}, "SearchReq")
        const res = await socketController.handleSearchReq(payload, req)
        childLogger.info({user: socket.data, res}, "SearchRes")
        io.to(socket.id).emit(Commands.SearchRes, res)
    }) 

    socket.on(Commands.TypingReq, async (req: Typing) => {
        childLogger.trace({req}, "typing")
        io.to(req.chatId).emit(Commands.TypingRes, req)
    })

    socket.on(Commands.ContactsReq, async (req: any) => {
        const result = await socketController.handleContactsReq(socket.data) 
        console.log('contacts requested', result)
        io.to(socket.id).emit(Commands.ContactsRes, result)
    })

    // for communications
    socket.on(Commands.SendReq, async (req: SendReq) => {
        const res = await socketController.handleSendReq(payload, req)
        console.log('SendRes',res)
        io.to(res.chatId).emit(Commands.SendRes, res)
    })
    
    socket.on(Commands.NewGroupReq, async(req: NewGroupReq) => {
        // console.log('new group req', req)
        const {memberships, msg, chatId} = await socketController.handleNewGroupReq(payload, req)
        memberships.forEach(({userId}) => sockets.getSocket(userId)?.join(chatId))
        console.log('new group, msg', msg)
        io.to(chatId).emit(Commands.SendRes, msg)
    })

    socket.on(Commands.GroupRemoveReq, async(req: GroupRemoveReq) => {
        const res = await socketController.handleGroupRemoveReq(payload, req)
        // todo
    })

    socket.on(Commands.UserInfoReq, async (req: UserInfoReq) => {
        const res = await socketController.handleUserInfoReq(payload, req)
        io.to(socket.id).emit(Commands.UserInfoRes, res)
    })

    socket.on(Commands.GroupInfoReq, async(req: GroupInfoReq) => {
        const res = await socketController.handleGroupInfoReq(payload, req)
        io.to(socket.id).emit(Commands.GroupInfoRes, res)
    })
})