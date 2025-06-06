import { v4 as uuid } from 'uuid'
import { ChatId, DbUser, UserId, MessageId, ChatPinStatus, User } from "shared/src/Types";
import { UserInfo as DbUserInfo, UserInfoCollection } from "shared/src/UserInfo";
import { MessagePostReq, MessagePostRes } from "shared/src/Message";
import dayjs from "dayjs";
import { EditChanges, GroupCreateReq } from 'shared/src/Group';
import { GroupCreateRes } from 'shared/src/ChatControl';
import { Chat, ChatPin, ChatInfo as DbChatInfo, Message as DbMessage, Membership } from '../models/models';
import { ChatInfo } from 'shared/src/ChatInfo';
import { Message } from 'shared/src/Message';

import { UserCache } from '../cache/users';
import { ChatCache } from '../cache/chats'
import { ChatInfoCache } from '../cache/chatInfo'
import { MembershipCache } from '../cache/memberships'
import { PinCache } from '../cache/pins'
import { MessageCache } from '../cache/messages'

export const userCache = new UserCache(u => u.id)
export const chatCache = new ChatCache(c => c.id)
export const chatInfoCache = new ChatInfoCache(c => c.id)
export const membershipCache = new MembershipCache(m => m.id)
export const pinCache = new PinCache(p => p.id)
export const messageCache = new MessageCache(m => m.id)


export const controller = {

    handleUsersRequest: async (userId: UserId): Promise<UserInfoCollection> => {
        const userMemberships = await membershipCache.getUserMemberships(userId)
        const chatIds = userMemberships.map(m => m.chatId)
        const memberships = await membershipCache.getMembershipsOfUserContacts(userId, chatIds)
        const contactIds = memberships.map(m => m.userId).filter(id => id !== userId)
        const contacts = await userCache.getUsersAsContacts(userId, contactIds)

        // preparing cache
        await chatInfoCache.getForUserId(userId, chatIds)
        await chatCache.getUserChats(userId, chatIds)
        await pinCache.getUserPins(userId)
        await messageCache.getMessagesForUser(userId)

        return Object.fromEntries( contacts.map(user => ([user.id, {
            id: user.id,
            iconSrc: user.iconSrc,
            name: user.username
        }])) )
    },


    handleSearch: async (userId: UserId, term: string): Promise<UserInfoCollection> => {
        const users = await userCache.search(term)

        return Object.fromEntries( users.map(user => ([user.id, {
            id: user.id,
            iconSrc: user.iconSrc,
            name: user.username
        }])) )
    },


    handleInitLoading: async (userId: UserId) => {
        const userMemberships = await membershipCache.getUserMemberships(userId)
        const chatIds = userMemberships.map(m => m.chatId)
        const memberships = await membershipCache.getMembershipsOfUserContacts(userId, chatIds)

        const contactIds = memberships.map(m => m.userId).filter(id => id !== userId)
        const contacts = await userCache.getUsersAsContacts(userId, contactIds)
        const contactMap = new Map( contacts.map(c => [c.id, c]) )
    

        await chatCache.getChatsOfUser(userId, chatIds)
        // const chatMap = new Map( chats.map(c => [c.id, c]) )

        // const groupedChats = new Map( chats.map(c => [c.id, c]) )        

        // it is only groups
        // const groupInfos = await chatInfoCache.getChatInfoOfUser(userId, chatIds)
        const groupInfos = await chatInfoCache.getForUserId(userId, chatIds)
        const groupInfoMap = new Map( groupInfos.map(i => [i.chatId, i]) )


        const groupedMembers = memberships.reduce((acc, m) => {
            if(!acc.has(m.chatId)){
                acc.set(m.chatId, [])
            }
            if(m.userId !== userId){
                acc.get(m.chatId)!.push(m.userId)
            }
            return acc
        }, new Map<string, string[]>())

        const infos = new Map<string, ChatInfo>()
        for(const [chatId, mems] of groupedMembers.entries()){
            if(groupInfoMap.has(chatId)){
                const i = groupInfoMap.get(chatId)!
                infos.set(chatId, {
                    id: i.chatId,
                    name: i.name,
                    iconSrc: i.iconSrc,
                    isGroup: true
                })
            }
            else { // dm
                const other = contactMap.get(mems[0])!
                infos.set(chatId, { 
                    id: chatId,
                    name: other?.username,
                    iconSrc: other.iconSrc,
                    isGroup: false
                })
            }
        }

        // const chats = await chatCache.getUserChats(userId, chatIds)
        const pins = await pinCache.getUserPins(userId)
        // const messages = await messageCache.getMessagesForUser(userId, chatIds)
        const messages = await messageCache.getMessagesForUser(userId)

        // every chat must have chat info in response!

       return {
            chatInfo: Object.fromEntries( infos.entries() ),
            chatMessageIds: messages.sort(m => -
                m.timestamp).reduce((acc, m) => {
                    if(m.chatId in acc) { 
                        acc[m.chatId].push(m.id) 
                        return acc 
                    } 
                    acc[m.chatId] = [m.id]
                     return acc 
                }, {} as {[P: ChatId]: MessageId[]}
            ),
            messages: Object.fromEntries( messages.map(m => [m.id, m]) ),
            unseenCount: {},
            members: memberships.reduce((acc, m) => {
                if(!(m.chatId in acc)){
                    acc[m.chatId] = [m.userId]
                    return acc
                }
                acc[m.chatId].push(m.userId)
                return acc
            }, {} as {[P: ChatId]: UserId[]}),
            admins: memberships.filter(m => m.isAdmin).reduce((acc, m) => {
                if(m.chatId in acc){
                    acc[m.chatId] = [m.userId]
                    return acc
                }
                acc[m.chatId].push(m.userId)
                return acc
            }, {} as {[P: ChatId]: UserId[]}),
            pinned: pins.map(p => p.chatId),
       }
    },

    togglePin: async (userId: UserId, chatId: ChatId): Promise<ChatPinStatus> => {
        const pins = await pinCache.getUserPins(userId)
        const pin = pins.find(p => p.chatId === chatId)
        let pinned = false
        if(!pin){
            const newPin: ChatPin  = {id: uuid(), chatId, userId}
            pinCache.insertPin(newPin)
            pinned = true
        }
        else {
            pinCache.removePin(pin.id)
        }
        return {chatId, pinned}
    },

    // this should return multiple objects: message itself, chat info for all members, and users
    // chat info should be one for all in case of group
    // or personal in case of dm
    postMessage: async (userId: UserId, req: MessagePostReq): Promise<MessagePostRes[]> => {
        const { chatId, content } = req
        
        // reload
        // await messageCache.getMessageForChat(chatId)
        await messageCache.getMessagesForUser(userId)

        const memberships = await membershipCache.getChatMemberships(chatId)
        const users = await userCache.getAsChatMembers(chatId)
        const userCollection: UserInfoCollection = Object.fromEntries( users.map(u => [u.id, {id: u.id, name: u.username, iconSrc: u.iconSrc}]))

        const newMessage: Message = {
            messageId: uuid(),
            chatId,
            sender: userId,
            content,
            timestamp: dayjs().valueOf()
        }
        const dbMessage: DbMessage = {
            id: newMessage.messageId,
            userId,
            chatId,
            content,
            timestamp: dayjs().toDate()
        };


        const infos = await chatInfoCache.getChatInfo(chatId);

        (async () => await messageCache.insertMessage(dbMessage))()

        if(infos.length === 1){
            const ci = infos[0]
            return [{
                message: newMessage,
                chatInfo: { id: ci.chatId, name: ci.name, isGroup: true, iconSrc: ci.iconSrc},
                users: userCollection,

                target: 'group',
                targetId: ci.chatId
            }]
        }

        const otherId = memberships.filter(m => m.userId != userId)[0].userId
        
        return [
            {
                message: newMessage,
                users: userCollection,
                chatInfo: { id: chatId, name: userCollection[otherId].name, isGroup: false, iconSrc: userCollection[otherId].iconSrc},
                target: 'user',
                targetId: userId
            },
            {
                message: newMessage,
                users: userCollection,
                chatInfo: { id: chatId, name: userCollection[userId].name, isGroup: false, iconSrc: userCollection[userId].iconSrc},
                target: 'user',
                targetId: otherId
            }
        ]
    },

    handleChatWithUser: async(userId: UserId, req: UserId) => {

        const chats = await chatCache.getDmBetween(userId, req)
        
        let chat: Chat

        let dbMessages: DbMessage[]
        let chatId: string

        if(chats.length === 0){
            chat = {id: uuid(), created: dayjs().toDate(), isGroup: false}
            const member1: Membership = {id: uuid(), userId, chatId: chat.id, isAdmin: false, created: chat.created}
            const member2: Membership = {id: uuid(), userId: req, chatId: chat.id, isAdmin: false, created: chat.created}

            await (async () => {
                await chatCache.insert(chat)
                await Promise.all([membershipCache.insert(member1), membershipCache.insert(member2)])
            })()

            dbMessages = []
        }
        else {
            chat = chats[0]
            chatId = chats[0].id
            dbMessages = await messageCache.getMessageForChat(chatId)
        }

        const [ other ] = await userCache.getUserById(req)
        const chatInfo: ChatInfo = {id: chat.id, name: other.username, iconSrc: other.iconSrc, isGroup: false} 
        const messages: Message[] = dbMessages.map(m => ({
            messageId: m.id,
            sender: m.userId,
            chatId: m.chatId,
            content: m.content,
            timestamp: dayjs(m.timestamp).valueOf()
        }))

        return {
            chatId: chat.id,
            info: chatInfo,
            chatMessageIds: { [chat.id]: messages.sort((m1, m2) => 
                m1.timestamp > m2.timestamp ? 1 : -1).map(m => 
                    m.messageId) },
            messages: Object.fromEntries( messages.map(m => [m.messageId, m]) ),
            members: [userId, req],
            admins: []
        }
    },

    handleGroupCreate: async (userId: UserId, req: GroupCreateReq) => {
        const { name, members, admins } = req

        const created = dayjs()

        // todo: load all members data

        const chat: Chat = { id: uuid(), created: created.toDate(), isGroup: true}
        const chatInfo: DbChatInfo = { id: uuid(), chatId: chat.id, name, iconSrc: ''}
        const memberships: Membership[] = members.map(id => ({
            id: uuid(), 
            userId: id, 
            chatId: chat.id, 
            created: created.toDate(), 
            isAdmin: admins.includes(id)
        }))

        chatCache.insert(chat)  
        chatInfoCache.insert(chatInfo)
        memberships.forEach(m => membershipCache.insert(m))

        const result: GroupCreateRes = {
            id: uuid(),
            created: created.valueOf(),
            chatMessageIds: [],
            messages: {},
            name, 
            admins, 
            members
        }

        return result
    },

    handleGroupEdit: async (userId: UserId, req: EditChanges): Promise<EditChanges> => {
        const { chatId, name, iconSrc, members, admins } = req

        const memberships = await membershipCache.getChatMemberships(chatId)
        const currentUsers: UserId[] = memberships.map(m => m.userId)

        const toExclude: UserId[] = currentUsers.filter(id => !members.includes(id))
        const toInclude: UserId[] = members.filter(id => !currentUsers.includes(id))

        for(const userId of toExclude){
            const membership = memberships.find(m => m.userId === userId)!
            membershipCache.remove(membership)
        }    

        const created = dayjs().toDate()

        for(const userId of toInclude){
            const membership: Membership = {
                id: uuid(),
                chatId,
                userId,
                isAdmin: admins.includes(userId),
                created 
            }
            membershipCache.insert(membership)
        }

        const [ chatInfo ] = await chatInfoCache.getChatInfo(chatId) 
        chatInfo.name = name
        chatInfo.iconSrc = iconSrc
        chatInfoCache.insert(chatInfo) 

        return req
    },

    handleGroupDelete: async (userId: UserId, chatId: ChatId): Promise<ChatId> => {
        const [ chat ] = await chatCache.getChats([chatId])  
        chatCache.remove(chatId)
        return chatId
    }
}


