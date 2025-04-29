import { v4 as uuid } from 'uuid'
import { getCache } from "../cache1";
import { ChatId, DbUser, UserId, MessageId, ChatPinStatus, User } from "shared/src/Types";
import { UserInfo as DbUserInfo, UserInfoCollection } from "shared/src/UserInfo";
import { MessagePostReq } from "shared/src/Message";
import dayjs from "dayjs";
import { EditChanges, GroupCreateReq } from 'shared/src/Group';
import { GroupCreateRes } from 'shared/src/ChatControl';

import { Chat, ChatInfo as DbChatInfo, Message as DbMessage, Membership } from '../models/models';

import { ChatInfo } from 'shared/src/ChatInfo';
import { Message } from 'shared/src/Message';
import { UserInfo } from 'shared/src/UserInfo';


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

        const contactIds = memberships.map(m => m.userId).filter(id => id !== userId)
        const contacts = await userCache.getUsersAsContacts(userId, contactIds)
        const contactMap = new Map( contacts.map(c => [c.id, c]) )
        

        // const chats = await chatCache.getChatsOfUser(userId, chatIds)
        // const groupedChats = new Map( chats.map(c => [c.id, c]) )        

        // it is only groups
        const groupInfos = await chatInfoCache.getChatInfoOfUser(userId, chatIds)
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
                    name: i.name
                })
            }
            else { // dm
                const name = contactMap.get(mems[0])!.username // it is not name, it is id!
                infos.set(chatId, { 
                    id: chatId,
                    name
                })
            }
        }

        // const chats = await chatCache.getUserChats(userId, chatIds)
        const pins = await pinCache.getUserPins(userId)
        const messages = await messageCache.getMessagesForUser(userId, chatIds)

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
            pinCache.createPin(userId, chatId)
            pinned = true
        }
        else {
            pinCache.removePin(pin)
        }
        return {chatId, pinned}
    },

    // this should return multiple objects: message itself, chat info for all members
    postMessage: async (userId: UserId, req: MessagePostReq): Promise<Message> => {
        const { chatId, content } = req
        
        // reload
        await messageCache.getMessageForChat(chatId)

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
        }
        
        messageCache.insertMessage(dbMessage)
        return newMessage
    },

    handleChatWithUser: async(userId: UserId, req: UserId) => {
        const memberships1 = await membershipCache.getUserMemberships(userId)
        const memberships2 = await membershipCache.getUserMemberships(req)

        const chatIds1 = memberships1.map(m => m.chatId)
        const chatIds2 = memberships2.map(m => m.chatId)

        const user1Chats = await chatCache.getChatsOfUser(userId, chatIds1)
        const user2Chats = await chatCache.getChatsOfUser(req, chatIds2)

        const chats1 = new Map(user1Chats.map(c => [c.id, c]))
        const chats2 = new Map(user2Chats.map(c => [c.id, c]))

        const info1 = await chatInfoCache.getChatInfoOfUser(userId, chatIds1)
        const info2 = await chatInfoCache.getChatInfoOfUser(req, chatIds2)

        const ids1Set = new Set( chatIds1 )
        const ids2Set = new Set( chatIds2 )

        const [ other ] = await userCache.getUserById(req)

        let targetChat: Chat | undefined = undefined
        let chatInfo: DbChatInfo
        let messages: DbMessage[]

        for(const id of ids1Set){
            if(ids2Set.has(id) && chats1.has(id)){
                targetChat = chats1.get(id)!
                break
            }
        }

        if(targetChat === undefined){
            const newChat: Chat = { id: uuid(), isGroup: false, created: dayjs().toDate()}
            chatInfo = {id: uuid(), chatId: newChat.id, name: '', iconSrc: ''}
            const member1: Membership = {id: uuid(), userId, chatId: newChat.id, isAdmin: false, created: newChat.created}
            const member2: Membership = {id: uuid(), userId: req, chatId: newChat.id, isAdmin: false, created: newChat.created}
            messages = []

            chatCache.insert(newChat)
            chatInfoCache.insert(chatInfo)
            membershipCache.insert(member1)
            membershipCache.insert(member2)
            targetChat = newChat
        }
        else {
            const infos = await chatInfoCache.getChatInfo(targetChat.id)
            chatInfo = infos[0]
            messages = await messageCache.getMessageForChat(targetChat.id)
        }

        const msgs: Message[] = messages.map(m => ({
            messageId: m.id,
            sender: m.userId,
            chatId: m.chatId,
            content: m.content,
            timestamp: dayjs(m.timestamp).valueOf()
        }))

        return {
            chatId: targetChat.id,
            info: {
                id: targetChat.id,
                name: other.username
            } as ChatInfo,
            chatMessageIds: { [targetChat.id]: messages.sort((m1, m2) => 
                m1.timestamp.getMilliseconds() > m2.timestamp.getMilliseconds() ? 1 : -1).map(m => 
                    m.id) },
            messages: Object.fromEntries( msgs.map(m => [m.messageId, m]) ),
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


