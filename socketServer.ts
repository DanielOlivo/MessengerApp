import { Server } from 'socket.io'
import { createServer } from 'http'

import app from './app'
import { verifyToken } from './middlewares/socketAuth'
import userModel from './models/users'
import groupModel from './models/groups'
import messageModel from './models/messages'
import dmModel from './models/dms'
import { Chats, TokenPayload, ChatId, UserId, MessageId, SearchResult } from './types/Types'
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
        io.to(socket.id).emit('dmRes', dm)
    })

    socket.on('sendDm', async(userId: UserId, content: string) => {

    })

    socket.on('msgRead', async(msgId: MessageId) => {

    })

    socket.on('typesDm', async(chatId: ChatId) => {

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