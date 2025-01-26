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
    MessageReadRes} from './types/Types'
import Sockets from './controllers/sockets'

import socketController from './controllers/socket'
import { Res } from './controllers/socket'


export const httpServer = createServer(app)
export const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
})


const sockets = new Sockets()

export enum Commands {
    ChatListReq = 'clrq',
    ChatListRes = 'clrs',

    ChatMsgReq = 'cmrq',
    ChatMsgRes = 'cmrs',

    HeaderReq = 'hrq',
    HeaderRes = 'hrs'
}

// FOR TESTING
io.use(verifyToken)

io.on('connection', (socket) => {

    console.log('new connection', socket.data)

    socket.on(Commands.ChatListReq, async arg => {
        const result = await socketController.getChatList(socket.data, '')
        // console.log('clrq', result)

        io.to(socket.id).emit('clrs', result)
    })

    socket.on(Commands.ChatMsgReq, async (chatId: ChatId) => {
        const result = await socketController.getMessagesinChat(socket.data, chatId)
        console.log(Commands.ChatMsgRes, result)
        io.to(socket.id).emit('cmrs', result)
    })

    socket.on(Commands.HeaderReq, async (chatId: ChatId) => {
        const result = await socketController.getHeaderInfo(socket.data, chatId)
        console.log(Commands.HeaderRes, result)
        io.to(socket.id).emit(Commands.HeaderRes, result)
    })

    // setInterval(() => {
    //     console.log('emitting: PING')
    //     io.to(socket.id).emit('PNG', 'PING')
    // }, 2000)

    socket.on('SAY', arg => {
        console.log('SAY ' + arg)
    })

    function setup<T,K>(name: string, fn: (auth: TokenPayload, a: T) => Promise<Res<K>>){
        const payload = socket.data as TokenPayload

        socket.on(name, async (arg: T) => {
            const {sendBefore, join, leave, sendAfter} = await fn(payload, arg)

            if(sendBefore){
                Object.entries(sendBefore).forEach(([userId, data]) => {
                    io.to(sockets.getSocket(userId).id).emit(name, data)
                })
            }

            if(leave){
                Object.entries(leave).forEach(([userId, roomId]) => 
                    sockets.getSocket(userId)?.leave(roomId))
            }

            if(join){
                Object.entries(join).forEach(([userId, roomId]) => 
                    sockets.getSocket(userId)?.join(roomId))
            }

            if(sendAfter){
                Object.entries(sendAfter).forEach(([userId, data]) => {
                    io.to(sockets.getSocket(userId).id).emit(name, data)
                })
            }
        })
    }


    setup('ping1', socketController.ping1)
    setup('search', socketController.search)
    setup('chats.get', socketController.getChats)

    setup('dm.get', socketController.getDm)

    setup('g.create', socketController.createGroup)
    setup('g.remove', socketController.removeGroup)
    setup('g.add', socketController.addMember)
    setup('g.leave', socketController.leaveGroup)

    setup('msg', socketController.msg)
    setup('msg.read', socketController.readMsg)

    sockets.add(socket.data.id, socket)

    socket.on('ping', arg => {
        io.to(socket.id).emit('ping', arg)
    })

    // contacts manipulations

    socket.on('getChats', async(arg) => {
        const {id}: TokenPayload = socket.data
        const res: Chats = {
            groups: await groupModel.getAllByUser(id),
            dms: await dmModel.getAllByUserId(id)
        }
        io.to(socket.id).emit('chatsRes', res)
    })

    socket.on('unread', async(arg) => {
        const {id}: TokenPayload = socket.data
        const messages = await unreadModel.get(id)
        io.to(socket.id).emit('unread', messages)
    })


    // dms
    socket.on('getDm', async(userId: UserId) => {
        const {id}: TokenPayload = socket.data
        let dm = await dmModel.getByUserIds(id, userId)
        if(!dm){
            dm = await dmModel.create(id, userId)
        }

        socket.join(dm.id)
        sockets.getSocket(userId)?.join(dm.id)

        io.to(socket.id).emit('dmRes', dm)
    })

    socket.on('sendDm', async({userId, content}: DMPostReq) => {
        const {id}: TokenPayload = socket.data
        // console.log('uuids', id, userId)
        const dm = await dmModel.getByUserIds(id, userId)  
        const message = await messageModel.create(dm.id, id, content)
        const res: DMPosted = {dm, message}

        await Promise.all([
            unreadModel.createForUser(id, message.id),
            unreadModel.createForUser(userId, message.id)
        ])

        io.to(dm.id).emit('dmPosted', res) 
    })

    socket.on('msgRead', async(req: MessageReadReq) => {
        const {id}: TokenPayload = socket.data
        await unreadModel.remove(id, req.message.id)        
        const res: MessageReadRes = {userId: id, message: req.message}
        io.to(req.message.chatId).emit('messageReadRes', res)
    })

    socket.on('types', async(chatId: ChatId) => {
        const {id}: TokenPayload = socket.data
        io.to(chatId).emit('types', {userId: id, chatId})
    })

    socket.on('dmMsgAll', async(chatId: ChatId) => {

    })

    // groups
    socket.on('createGroup', async(groupName?: string) => {

    }) 

    socket.on('addMember', async(chatId: ChatId, userId: UserId) => {

    })

    socket.on('removeGroupReq', async(chatId: ChatId) => {

    })


    socket.on('leaveGroupReq', async(chatId: ChatId) => {

    })

    socket.on('getGroups', async() => {

    })

    // messaging
    socket.on('sendMessage', async(chatId: ChatId, content: string) => {

    })

    socket.on('editMessage', async(messageId: MessageId, content: string) => {

    })

    socket.on('removeMessage', async(messageId: MessageId) => {

    })

    socket.on('getMessages', async(chatId: ChatId, upTo: Date) => {

    })

    socket.on('getAllMessages', async(chatId: ChatId) => {

    })

    socket.on('readMessage', async(messageId: MessageId) => {

    })

    socket.on('sendTyping', async(chatId: ChatId) => {

    })

    


    // socket.on('dm_id', async (chatId: ChatId, content: string) => {
    //     const {id} = socket.data as TokenPayload
    //     const message = await messageModel.create(chatId, id, content)
    //     io.to(chatId).emit('dm', message)
    // })

    // socket.on('dm_user', async(userId: UserId, content: string) => {
    //     const {id} = socket.data as TokenPayload

    //     let dm = await dmModel.getByUserIds(id, userId)
    //     if(!dm){
    //         dm = await dmModel.create(id, userId)
    //         socket.join(dm.id)
    //         sockets.getSocket(userId)?.join(dm.id)
    //     }

    //     const message = await messageModel.create(dm.id, id, content)

    //     io.to(dm.id).emit('dm', message)
    // })

    // socket.on('groupNew', async(userId: UserId, name?: string) => {
    //     const {group, membership} = await groupModel.create(userId, name)
    //     socket.join(group.id)
    //     io.to(socket.id).emit('groupAdded', {group, membership})
    // })

    // socket.on('groupNewMember', async(groupId: ChatId, userId: UserId) => {
    //     const membership = await groupModel.addToGroup(userId, groupId)
    //     sockets.getSocket(userId)?.join(groupId)
    //     io.to(groupId).emit('groupMemberAdded', membership)
    // })
})