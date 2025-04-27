import { v4 as uuid } from 'uuid'
import { getCache } from "../cache1";
import { ChatId, DbUser, UserId, MessageId, ChatPinStatus, User } from "shared/src/Types";
import { UserInfo, UserInfoCollection } from "shared/src/UserInfo";
import { MessagePostReq } from "shared/src/Message";
import dayjs from "dayjs";
import { EditChanges, GroupCreateReq } from 'shared/src/Group';
import { GroupCreateRes } from 'shared/src/ChatControl';

import { Chat, ChatInfo, Message, Membership } from '../models/models';

// import userCache from '../cache/users'
import { getUserCache } from '../cache/users';
import { getMembershipCache } from '../cache/memberships'
import { getChatCache } from '../cache/chats'
import { getPinCache } from '../cache/pins'
import { getChatInfoCache } from '../cache/chatInfo'
import { getMessageCache } from '../cache/messages'
import { intersection } from '../utils/intersection';

// export to enable testing
export const userCache = getUserCache()
export const membershipCache = getMembershipCache()
export const chatCache = getChatCache()
export const pinCache = getPinCache()
export const chatInfoCache = getChatInfoCache()
export const messageCache = getMessageCache()

export const controller = {

    handleUsersRequest: async (userId: UserId): Promise<UserInfoCollection> => {
        const userMemberships = await membershipCache.getUserMemberships(userId)
        const chatIds = userMemberships.map(m => m.chatId)
        const memberships = await membershipCache.getMembershipsOfUserContacts(userId, chatIds)
        const contactIds = memberships.map(m => m.userId).filter(id => id !== userId)
        const contacts = await userCache.getUsersAsContacts(userId, contactIds)

        // caching 
        const info = await chatInfoCache.getChatInfoOfUser(userId, chatIds)
        const chats = await chatCache.getUserChats(userId, chatIds)
        const pins = await pinCache.getUserPins(userId)
        const messages = await messageCache.getMessagesForUser(userId, chatIds)


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
        // const contactIds = memberships.map(m => m.userId).filter(id => id !== userId)
        // const contacts = await userCache.getUsersAsContacts(userId, contactIds)

        const info = await chatInfoCache.getChatInfoOfUser(userId, chatIds)
        // const chats = await chatCache.getUserChats(userId, chatIds)
        const pins = await pinCache.getUserPins(userId)
        const messages = await messageCache.getMessagesForUser(userId, chatIds)


       return {
            chatInfo: info.reduce((acc, m) => {
                    acc[m.chatId] = m; 
                    return acc 
                }, {} as {[P: ChatId]: ChatInfo}),
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
            pinCache.createPin(userId, chatId)
            pinned = true
        }
        else {
            pinCache.removePin(pin)
        }
        return {chatId, pinned}
    },

    postMessage: async (userId: UserId, req: MessagePostReq): Promise<Message> => {
        const { chatId, content } = req
        
        // reload
        const messages = await messageCache.getMessageForChat(chatId)

        const newMessage: Message = {
            id: uuid(),
            chatId,
            userId,
            content,
            timestamp: dayjs().toDate()
        }
        messageCache.insertMessage(newMessage)
        return newMessage
    },

    handleChatWithUser: async(userId: UserId, req: UserId) => {
        // 
        const memberships1 = await membershipCache.getUserMemberships(userId)
        const memberships2 = await membershipCache.getUserMemberships(req)

        const chats1 = new Set(memberships1.map(m => m.chatId))
        const chats2 = new Set(memberships2.map(m => m.chatId))
        const mutualIds = Array.from( intersection(chats1, chats2) ) 
        const chats = await chatCache.getChats(mutualIds)
        const chat = chats.find(c => !c.isGroup)

        if(!chat){
            throw new Error()
        }

        const [ chatInfo ] = await chatInfoCache.getChatInfo(chat.id)
        const messages = await messageCache.getMessageForChat(chat.id)

        return {
            chatId: chat.id,
            info: {
                name: chatInfo.name,
                iconSrc: chatInfo.iconSrc,
                status: 'status',
                isGroups: false
            },
            chatMessageIds: { [chat.id]: messages.map(m => m.id) },
            messages: Object.fromEntries( messages.map(m => [m.id, m]) ),
            members: [userId, req],
            admins: []
        }
    },

    handleGroupCreate: async (userId: UserId, req: GroupCreateReq) => {
        const { name, members, admins } = req

        const created = dayjs()

        // todo: load all members data

        const chat: Chat = { id: uuid(), created: created.toDate(), isGroup: true}
        const chatInfo: ChatInfo = { id: uuid(), chatId: chat.id, name, iconSrc: ''}
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


