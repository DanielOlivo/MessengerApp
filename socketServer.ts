import { Server } from 'socket.io'
import { createServer } from 'http'

import app from './app'
import { verifyToken } from './middlewares/socketAuth'
import userModel from './models/users'
import groupModel from './models/groups'
import messageModel from './models/messages'
import dmModel from './models/dms'
import unreadModel from './models/unread'
import { 
    Chats, TokenPayload, ChatId, 
    UserId, MessageId, SearchResult, DMPosted, 
    DMPostReq, Unread, MessageReadReq, 
    MessageReadRes} from './types/Types'
import Sockets from './controllers/sockets'
export const httpServer = createServer(app)
export const io = new Server(httpServer)

const sockets = new Sockets()

io.use(verifyToken)

io.on('connection', (socket) => {

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

    socket.on('getUnread', async() => {

    })

    socket.on('search', async arg => {
        const {id}: TokenPayload = socket.data
        const res: SearchResult = {
            users: await userModel.handleSearchBy(id, arg),
            groups: await groupModel.getAllByUser(id)
        }
        io.to(socket.id).emit('search_result', res)
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