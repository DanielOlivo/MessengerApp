import { v4 as uuid } from 'uuid'
import { getCache } from "../cache1";
import { ChatId, DbUser, UserId, MessageId, ChatPinStatus, Membership, User } from "shared/src/Types";
import { UserInfo, UserInfoCollection } from "shared/src/UserInfo";
import { Message, MessagePostReq } from "shared/src/Message";
import { ChatInfo } from "shared/src/ChatInfo";
import dayjs from "dayjs";
import { EditChanges, GroupCreateReq } from 'shared/src/Group';
import { GroupCreateRes } from 'shared/src/ChatControl';

import userCache from '../cache/users'
import membershipCache from '../cache/memberships'
import chatCache from '../cache/chats'
import pinCache from '../cache/pins'
import chatInfoCache from '../cache/chatInfo'
import messageCache from '../cache/messages'

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
        const info = await chatInfoCache.getChatInfoOfUser(userId, chatIds)
        const chats = await chatCache.getUserChats(userId, chatIds)
        const memberships = await membershipCache.getMembershipsOfUserContacts(userId, chatIds)
        const pins = await pinCache.getUserPins(userId)
        const messages = await messageCache.getMessagesForUser(userId, chatIds)

        const contactIds = memberships.map(m => m.userId).filter(id => id !== userId)
        const contacts = await userCache.getUsersAsContacts(userId, contactIds)

        return Object.fromEntries( contacts.map(user => ([user.id, {
            id: user.id,
            iconSrc: user.iconSrc,
            name: user.username
        }])) )
    },

    handleSearch: async (userId: UserId, term: string): Promise<UserInfoCollection> => {
        const users: DbUser[] = await cache.user.get(
            'username-starts=' + term,
            () => dbFns.searchUser(term),
            () => queries.searchUser(term)
        ) 
        return Object.fromEntries( users.map(user => ([user.id, {
            id: user.id,
            iconSrc: user.iconSrc,
            name: user.username
        }])) )
    },

    handleInitLoading: async (userId: UserId): Promise<ClientChatState> => {
        const chats = await cache.chat.get(
            'chats-user=' + userId,
            async () => await dbFns.getChatsOfUser(userId),
            () => queries.getChatsOfUser(userId)
        )

        const chatIds = chats.map(item => item.chatId) 

        const names = await cache.name.get(
            'chat-user=' + userId,
            async () => await dbFns.getNames(chatIds),
            () => queries.getNames(chatIds)
        )

        const pins = await cache.pin.get(
            'chat-user=' + userId,
            async () => await dbFns.getPins(chatIds),
            () => queries.getPins(userId)
        )

        const memberships = await cache.membership.get(
            'userid=' + userId,
            async () => await dbFns.getMemberships(chatIds),
            () => queries.getMemberships(userId, chatIds)
        )

        const messages = await cache.message.get(
            'userid=' + userId,
            async () => dbFns.getMessagesForChats(chatIds),
            () => queries.getMessagesForChats(userId, chatIds)
        )

       return {
            chatInfo: names.reduce((acc, m) => {acc[m.chatId] = {id: m.chatId, name: m.name }; return acc }, {} as {[P: ChatId]: ChatInfo}),
            chatMessageIds: messages.sort(m => -
                m.timestamp).reduce((acc, m) => {
                    if(m.chatId in acc) { 
                        acc[m.chatId].push(m.messageId) 
                        return acc 
                    } 
                    acc[m.chatId] = [m.messageId]
                     return acc 
                }, {} as {[P: ChatId]: MessageId[]}),

            messages: Object.fromEntries( messages.map(m => [m.messageId, m]) ),
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
        const [pin] = await cache.pin.get(
            'user=' + userId + 'chat=' + chatId,
            async () => await dbFns.getPin(userId, chatId),
            () => queries.getPin(userId, chatId)
        )

        pin.pinned = !pin.pinned
        cache.pin.update(pin, new Set(['']), () => dbFns.updatePin(pin)) // todo tags
        return {chatId, pinned: pin.pinned}
    },

    postMessage: async (userId: UserId, req: MessagePostReq): Promise<Message> => {
        const { chatId, content } = req
        
        // reload
        await cache.message.get(
            'chat=' + chatId,
            async () => dbFns.getMessagesForChat(chatId),
            () => queries.getMessagesForChat(chatId)
        )        

        const newMessage: Message = {
            chatId,
            sender: userId,
            content,
            timestamp: dayjs().valueOf(),
            messageId: uuid()
        }
        cache.message.insert(newMessage, new Set(), dbFns.insertMessage)

        return newMessage
    },

    handleChatWithUser: async(userId: UserId, req: UserId) => {
        // 
        const [ chatId ] = await cache.chat.get(
            'between=' + userId + ';' + req, 
            () => dbFns.getChatBetween(userId, req), 
            () => queries.getChatBetween(userId, req)
        )

        // later
        return {
            chatId: '',
            info: {
                name: '',
                iconSrc: '',
                status: 'status',
                isGroups: false
            },
            chatMessageIds: {},
            messages: {},
            members: [userId, req],
            admins: []
        }
    },

    handleGroupCreate: async (userId: UserId, req: GroupCreateReq) => {
        const { name, admins, membmers } = req

        const result: GroupCreateRes = {
            id: '',
            created: 0,
            chatMessageIds: [],
            messages: {}
        }
        return result
    },

    handleGroupEdit: async (userId: UserId, req: EditChanges): Promise<EditChanges> => {

        return {
            chatId: '',
            name: '',
            members: [],
            admins: []
        }
    },

    handleGroupDelete: async (userId: UserId, chatId: ChatId): Promise<ChatId> => {

        // todo
        return chatId
    }
}


