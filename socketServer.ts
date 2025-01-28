import { Server } from 'socket.io'
import { createServer } from 'http'

import app from './app'
import { verifyToken } from './middlewares/socketAuth'
import userModel from './models/users'
import groupModel from './models/groups'
import messageModel from './models/messages'
import dmModel from './models/dms'
import unreadModel, {Unread} from './models/unread'
import { 
    Chats, TokenPayload, ChatId, 
    UserId, MessageId, SearchResult, DMPosted, 
    DMPostReq, MessageReadReq, 
    MessageReadRes,
    Message} from './types/Types'
import Sockets from './controllers/sockets'

import socketController from './controllers/socket'
import { Res } from './controllers/socket'
import { ChatListItem, ChatListReq, ChatSelect, ChatSelectRes, GroupInfoReq, GroupRemoveReq, HeaderInfo, NewGroupReq, SearchReq, SendReq, SendRes, Typing, UserInfoReq } from '@clientTypes'


export const httpServer = createServer(app)
export const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
})


const sockets = new Sockets()

export const enum Commands {
    ChatListReq = 'clrq',
    ChatListRes = 'clrs',

    SearchReq = 'schrq',
    SearchRes = 'schrs',

    ChatSelectionWithUser = 'cswurq',
    ChatSelectionReq = 'csrq',
    ChatSelectionRes = 'csrs',


    ChatMsgReq = 'cmrq',
    ChatMsgRes = 'cmrs',

    HeaderReq = 'hrq',
    HeaderRes = 'hrs',

    SendReq = 'srq',
    SendRes = 'srs',

    UserInfoReq = 'uirq',
    UserInfoRes = 'uirs',

    GroupInfoReq = 'girq',
    GroupInfoRes = 'girs',

    OnlineReq = 'orq',
    OnlineRes = 'ors',

    TypingReq = 'trq',
    TypingRes = 'trs',
    
    NewGroupReq = 'ngrq',
    NewGroupRes = 'ngrs',

    GroupRemoveReq = 'grrq',
    GroupRemoveRes = 'grrs',

    ContactsReq = 'crq',
    ContactsRes = 'crs'
}

export const Cmd = {
    SearchReq: 'schrq',
    SearchRes: 'schrs',
}

// FOR TESTING
io.use(verifyToken)

io.on('connection', async (socket) => {

    console.log('new connection', socket.data)

    const payload = socket.data

    // handle subscirptions 
    const chatids = await socketController.getAllChatIds(socket.data)
    chatids.forEach(({id}) => {
        socket.join(id)
    })


    // soecket setup

    // for user
    socket.on(Commands.ChatListReq, async (req: ChatListReq) => {
        const res: ChatListItem[] = await socketController.handleChatListReq(payload, req)
        io.to(socket.id).emit(Commands.ChatListRes, res)
    })

    socket.on(Commands.ChatSelectionReq, async(req: ChatSelect) => {
        const res: ChatSelectRes = await socketController.handleChatSelectionReq(payload, req)!
        console.log('chat select res', res)
        io.to(socket.id).emit(Commands.ChatSelectionRes, res)
    })

    socket.on(Commands.ChatSelectionWithUser, async(req: UserId) => {
        const res: ChatSelectRes = await socketController.handleDmRequestByUserId(payload, req)!
        socket.join(res.chatId)
        sockets.getSocket(req)?.join(res.chatId)
        console.log('chat select res', res)
        io.to(socket.id).emit(Commands.ChatSelectionRes, res)
    })

    socket.on(Commands.ChatMsgReq, async(chatId: ChatId)  => {
        const res = await socketController.handleChatMsgReq(payload, chatId)
        io.to(socket.id).emit(Commands.ChatMsgRes, res)
    })

    socket.on(Commands.SearchReq, async(req: SearchReq) => {
        // console.log('searching for ', req.criteria)
        const res = await socketController.handleSearchReq(payload, req)
        // console.log('search response: ', res)
        io.to(socket.id).emit(Commands.SearchRes, res)
    }) 

    socket.on(Commands.TypingReq, async (req: Typing) => {
        // send everyone in chat back
        io.to(req.chatId).emit(Commands.TypingRes, req)
    })


    socket.on(Commands.UserInfoReq, async (req: UserInfoReq) => {
        const res = await socketController.handleUserInfoReq(payload, req)
        io.to(socket.id).emit(Commands.UserInfoRes, res)
    })

    socket.on(Commands.GroupInfoReq, async(req: GroupInfoReq) => {
        const res = await socketController.handleGroupInfoReq(payload, req)
        io.to(socket.id).emit(Commands.GroupInfoRes, res)
    })


    // for communications
    socket.on(Commands.SendReq, async (req: SendReq) => {
        const res = await socketController.handleSendReq(payload, req)
        console.log('SendRes',res)
        io.to(res.chatId).emit(Commands.SendRes, res)
    })

    socket.on(Commands.NewGroupReq, async(req: NewGroupReq) => {
        const res = await socketController.handleNewGroupReq(payload, req)
        // todo
    })

    socket.on(Commands.GroupRemoveReq, async(req: GroupRemoveReq) => {
        const res = await socketController.handleGroupRemoveReq(payload, req)
        // todo
    })

    // socket.on(Commands.ChatListReq, async arg => {
    //     const result = await socketController.getChatList(socket.data, '')
    //     // console.log('clrq', result)

    //     io.to(socket.id).emit('clrs', result)
    // })

    // socket.on(Commands.ChatMsgReq, async (chatId: ChatId) => {
    //     const result = await socketController.getMessagesinChat(socket.data, chatId)
    //     console.log(Commands.ChatMsgRes, result)
    //     io.to(socket.id).emit('cmrs', result)
    // })

    // socket.on(Commands.HeaderReq, async (chatId: ChatId) => {
    //     const result = await socketController.getHeaderInfo(socket.data, chatId)
    //     console.log(Commands.HeaderRes, result)
    //     io.to(socket.id).emit(Commands.HeaderRes, result)
    // })

    // socket.on(Commands.SendReq, async ({chatId, content}: SendReq) => {
    //     console.log('chatId', chatId, 'content', content)
    //     const result: Message = await socketController.trySendChat(socket.data, {chatId, content});
    //     if(result) {
    //         const {chatId} = result
    //         io.to(chatId).emit(Commands.SendRes, result)
    //     }
    // })
    // setInterval(() => {
    //     console.log('emitting: PING')
    //     io.to(socket.id).emit('PNG', 'PING')
    // }, 2000)

    // socket.on('SAY', arg => {
    //     console.log('SAY ' + arg)
    // })



    // function setup<T,K>(name: string, fn: (auth: TokenPayload, a: T) => Promise<Res<K>>){
    //     const payload = socket.data as TokenPayload

    //     socket.on(name, async (arg: T) => {
    //         const {sendBefore, join, leave, sendAfter} = await fn(payload, arg)

    //         if(sendBefore){
    //             Object.entries(sendBefore).forEach(([userId, data]) => {
    //                 io.to(sockets.getSocket(userId).id).emit(name, data)
    //             })
    //         }

    //         if(leave){
    //             Object.entries(leave).forEach(([userId, roomId]) => 
    //                 sockets.getSocket(userId)?.leave(roomId))
    //         }

    //         if(join){
    //             Object.entries(join).forEach(([userId, roomId]) => 
    //                 sockets.getSocket(userId)?.join(roomId))
    //         }

    //         if(sendAfter){
    //             Object.entries(sendAfter).forEach(([userId, data]) => {
    //                 io.to(sockets.getSocket(userId).id).emit(name, data)
    //             })
    //         }
    //     })
    // }

    // type StepType = 'join' | 'leave' | 'send'

    // type JoinLeaveStep = {t: StepType, cmd: Commands, chatId: ChatId, userId: UserId}
    // type SendStep<T> = {t: StepType, cmd: Commands, chatId: ChatId, res: T}
    // type Step<T> = SendStep<T> | JoinLeaveStep


    // function setup2<T,K>(fn: (auth: TokenPayload, a: T) => Promise<Step<K>[]>) {
    //     const payload = socket.data as TokenPayload

    //     socket.on() 
    // }


    // setup('ping1', socketController.ping1)
    // setup('search', socketController.search)
    // setup('chats.get', socketController.getChats)

    // setup('dm.get', socketController.getDm)

    // setup('g.create', socketController.createGroup)
    // setup('g.remove', socketController.removeGroup)
    // setup('g.add', socketController.addMember)
    // setup('g.leave', socketController.leaveGroup)

    // setup('msg', socketController.msg)
    // setup('msg.read', socketController.readMsg)

    // sockets.add(socket.data.id, socket)

    // socket.on('ping', arg => {
    //     io.to(socket.id).emit('ping', arg)
    // })

    // contacts manipulations

    // socket.on('getChats', async(arg) => {
    //     const {id}: TokenPayload = socket.data
    //     const res: Chats = {
    //         groups: await groupModel.getAllByUser(id),
    //         dms: await dmModel.getAllByUserId(id)
    //     }
    //     io.to(socket.id).emit('chatsRes', res)
    // })

    // socket.on('unread', async(arg) => {
    //     const {id}: TokenPayload = socket.data
    //     const messages = await unreadModel.get(id)
    //     io.to(socket.id).emit('unread', messages)
    // })


    // dms
    // socket.on('getDm', async(userId: UserId) => {
    //     const {id}: TokenPayload = socket.data
    //     let dm = await dmModel.getByUserIds(id, userId)
    //     if(!dm){
    //         dm = await dmModel.create(id, userId)
    //     }

    //     socket.join(dm.id)
    //     sockets.getSocket(userId)?.join(dm.id)

    //     io.to(socket.id).emit('dmRes', dm)
    // })

    // socket.on('sendDm', async({userId, content}: DMPostReq) => {
    //     const {id}: TokenPayload = socket.data
    //     // console.log('uuids', id, userId)
    //     const dm = await dmModel.getByUserIds(id, userId)  
    //     const message = await messageModel.create(dm.id, id, content)
    //     const res: DMPosted = {dm, message}

    //     await Promise.all([
    //         unreadModel.createForUser(id, message.id),
    //         unreadModel.createForUser(userId, message.id)
    //     ])

    //     io.to(dm.id).emit('dmPosted', res) 
    // })

    // socket.on('msgRead', async(req: MessageReadReq) => {
    //     const {id}: TokenPayload = socket.data
    //     await unreadModel.remove(id, req.message.id)        
    //     const res: MessageReadRes = {userId: id, message: req.message}
    //     io.to(req.message.chatId).emit('messageReadRes', res)
    // })

    // socket.on('types', async(chatId: ChatId) => {
    //     const {id}: TokenPayload = socket.data
    //     io.to(chatId).emit('types', {userId: id, chatId})
    // })
})