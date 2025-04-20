import { v4 as uuid } from 'uuid'
import { getCache } from "../cache1";
import { ChatId, DbUser, UserId, MessageId, ChatPinStatus, User } from "shared/src/Types";
import { UserInfo, UserInfoCollection } from "shared/src/UserInfo";
import { MessagePostReq } from "shared/src/Message";
import dayjs from "dayjs";
import { EditChanges, GroupCreateReq } from 'shared/src/Group';
import { GroupCreateRes } from 'shared/src/ChatControl';

import { Chat, ChatInfo, Message, Membership } from '../models/models';

import userCache from '../cache/users'
import membershipCache from '../cache/memberships'
import chatCache from '../cache/chats'
import pinCache from '../cache/pins'
import chatInfoCache from '../cache/chatInfo'
import messageCache from '../cache/messages'
import { intersection } from '../utils/intersection';

interface ClientChatState {
    chatMessageIds: { [P: ChatId]: MessageId[]}
    chatInfo: { [P in ChatId]: ChatInfo}
    messages: { [P in MessageId] : Message}
    unseenCount: { [P in ChatId] : number}
    members: { [P: ChatId]: UserId[]}
    admins: { [P: ChatId]: UserId[] }
    pinned: ChatId[],
}


interface ChatRecord {
    chatId: ChatId
    isGroup: boolean
    created: number
}

interface ChatName {
    id: string
    chatId: ChatId
    name: string
}

interface ChatPin {
    id: string
    userId: UserId
    chatId: ChatId
    pinned: boolean
}

interface MembershipRecord {
    id: string 
    chatId: ChatId
    userId: UserId
    isAdmin: boolean
    created: number
}

interface Queries {
    getUserContacts: (userId: UserId) => Set<string>
    getContactsOf: (userId: UserId) => Set<string>
    searchUser: (term: string) => Set<string>

    getChatsOfUser: (userId: UserId) => Set<string> 
    getNamesForUser: (userId: UserId) => Set<string>
    getNames: (ids: ChatId[]) => Set<string>

    getPin: (userId: UserId, chatId: ChatId) => Set<string>
    getPins: (id: UserId) => Set<string>
    getPinsOfUser: (userId: UserId) => Set<string>

    getMemberships: (userId: UserId, ids: ChatId[]) => Set<string>
    getMessagesForChats: (userId: string, ids: ChatId[]) => Set<string>
    getMessagesForChat: (chatId: ChatId) => Set<string>

    getChatBetween: (user1: UserId, user2: UserId) => Set<string>

}

export interface DbFns {
    getUserById: (userId: UserId) => Promise<DbUser>,
    getUserContacts: (userId: UserId) => Promise<DbUser[]>
    searchUser: (term: string) => Promise<DbUser[]>    

    getChatsOfUser: (userId: UserId) => Promise<ChatRecord[]>
    getNamesForUser: (userId: UserId) => Promise<ChatName[]>
    getNames: (ids: ChatId[]) => Promise<ChatName[]>
    
    getPin: (userId: UserId, chatId: ChatId) => Promise<ChatPin[]>
    getPins: (ids: ChatId[]) => Promise<ChatPin[]>
    getPinsOfUser: (userId: UserId) => Promise<ChatPin[]>
    updatePin: (pin: ChatPin) => Promise<void>

    getMemberships: (ids: ChatId[]) => Promise<MembershipRecord[]>
    getMessagesForChats: (ids: ChatId[]) => Promise<Message[]>
    getMessagesForChat: (chatId: ChatId) => Promise<Message[]>

    insertMessage: (m: Message) => Promise<void>

    getChatBetween: (user1: UserId, user2: UserId) => Promise<ChatRecord[]>


}

const getQueries = (): Queries => { throw new Error()}
const getDbFns = (): DbFns => { throw new Error() }

const queries = getQueries()
const dbFns = getDbFns()

const cache = {
    user: getCache<DbUser>(user => user.id),
    chat: getCache<ChatRecord>(chat => chat.chatId),
    pin: getCache<ChatPin>(p => p.id),
    name: getCache<ChatName>(i => i.id),
    membership: getCache<MembershipRecord>(m => m.id),
    message: getCache<Message>(m => m.messageId)
}

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

    handleInitLoading: async (userId: UserId): Promise<ClientChatState> => {
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
            chatInfo: info.reduce((acc, m) => {acc[m.chatId] = {id: m.chatId, name: m.name }; return acc }, {} as {[P: ChatId]: ChatInfo}),
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
                if(m.chatId in acc){
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
        if(!pin){
            throw new Error()
        }
        pin.pinned = !pin.pinned
        pinCache.updatePin(pin)        
        return {chatId, pinned: pin.pinned}
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

        // todo
        return chatId
    }
}


