import {Socket} from 'socket.io'
import { ChatId, UserId, TokenPayload, 
    Message, MessageId, SearchResult, DM, 
    Group } from '../types/Types'
import db from '../config/db'
import userModel from '../models/users'
import chatModel from '../models/chats'
import dmModel from '../models/dms'
import groupModel from '../models/groups'
import membershipModel from '../models/memberships'
import messageModel from '../models/messages'
import unreadModel, {Unread, UnreadId} from '../models/unread'

export type Res<T> = {
    sendBefore?: {[id: string]: T}
    join?: {[id: UserId]: string}
    leave?: {[id: UserId]: string}
    sendAfter?: {[id: string]: T}
    error?: string
}

export interface ChatListItem {
    chatName: string
    content: string
    username: string,
    chatId: string
}

const controller = {


    search: async(payload: TokenPayload, criteria: string): Promise<Res<SearchResult>> => {
        const res: SearchResult = {
            users: await userModel.handleSearchBy(payload.id, criteria),
            groups: await groupModel.getAllByUser(payload.id)
        }

        return {sendBefore: {[payload.id]: res}}
    },

    getChatList: async(payload: TokenPayload, arg: any) => {
        const {id} = payload
        const result = await db.raw(`
            with dmids as (
                select id from dms where "user1Id"=\'${id}\' or "user2Id" = \'${id}\'
            )
            , dmnames as (
                select "dmId" as "chatId", username as "chatName"
                from "users"
                join 
                    (select id as "dmId", 
                    case when "user1Id" = \'${id}\' then "user2Id"
                    else "user1Id"
                    end as "userId"
                    from (select * from dms where "id" in (select * from dmids)))
                on "userId" = users.id
            )
            , groupids as (
                select "groupId" from memberships where "userId" = \'${id}\'
            )
            , groupnames as (
                select id as "chatId", name as "chatName"
                from groups 
                where "id" in (select * from groupids)
            )
            , chatnames as (
                select * from dmnames union select * from groupnames
            )
            , allids as (
                select * from dmids union select * from groupids
            )
            , last_messages as (
                select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created desc) as rn
                from (select * from messages where "chatId" in (select * from allids)) as m
            )
            select content, "chatName", lm."chatId", username
            from (select * from last_messages where rn=1) as lm
            join chatnames on chatnames."chatId"=lm."chatId"
            join users on users.id=lm."userId";
        `)
        console.log(result.rows)
        return result.rows as ChatListItem[]
    },

    getChats: async(payload: TokenPayload, arg: any) => {
        const [dms, groups] = await Promise.all([
            dmModel.getAllByUserId(payload.id),
            groupModel.getAllByUser(payload.id)
        ])

        return {
            sendBefore: {[payload.id]: {dms, groups}}
        }
    },

    /**return messages */
    unread: async(payload: TokenPayload, arg: any) => {
        const unread: Message[] = await unreadModel.get(payload.id)
        return {
            sendBefore: {[payload.id]: unread}
        }
    },

    // dms
    getDm: async(payload: TokenPayload, userId: UserId) => {
        let dm = await dmModel.getByUserIds(payload.id, userId)

        if(!dm){
            dm = await dmModel.create(payload.id, userId)
        }

        return {
            join: {
                [payload.id]: dm.id,
                [userId]: dm.id
            },

            sendAfter: {
                [payload.id]: dm
            }
        } 
    },

    // group actions
    createGroup: async(payload: TokenPayload, groupName?: string) => {
        const { group, membership } = await groupModel.create(payload.id, groupName)        

        return {
            join: {[payload.id]: group.id},
            sendAfter: {[payload.id]: {group, membership}}
        }
    },

    removeGroup: async(payload: TokenPayload, chatId: ChatId) => {
        const membership = await membershipModel.get(payload.id, chatId)

        if(!membership || !membership.isAdmin){
            return {
                sendBefore: {[payload.id]: 'not authorized'}
            }
        }

        await chatModel.remove(chatId)

        return {
            sendBefore: {[chatId]: chatId},
        }
    },

    addMember: async(payload: TokenPayload, arg: {chatId: ChatId, userId: ChatId}) => {
        const {chatId, userId} = arg
        const [membership, group] = await Promise.all([
            membershipModel.create(userId, chatId, false),
            groupModel.getById(chatId)
        ])

        return {
            join: {[userId]: chatId},
            sendAfter: {[chatId]: {group, membership}}
        }
    },

    changeRole: async(payload: TokenPayload, arg: {userId: UserId, chatId: ChatId, isAdmin: boolean}) => {
        throw new Error() 
    },

    leaveGroup: async(payload: TokenPayload, chatId: ChatId) => {
        const [membershipId, group] = await Promise.all([
            membershipModel.removeByUserIdChatId(payload.id, chatId),
            groupModel.getById(chatId)
        ])

        return {
            leave: {[payload.id]: chatId},
            sendBefore: {[chatId]: payload.id}
        }
    },


    // messaging
    msg: async(payload: TokenPayload, arg: {chatId: ChatId, content: string}): Promise<Res<{message: Message, unread: Unread[]}>> => {
    // msg: async(payload: TokenPayload, arg: {chatId: ChatId, content: string}) => {
        const {chatId, content} = arg
        const chat = await chatModel.getById(chatId)
        const membership = await membershipModel.get(payload.id, chatId)

        if(!chat || (!chat.isDm && !membership)){
            return {
                // sendBefore: {[payload.id]: 'not authorized'}
                error: 'not authorized',
            }
        }

        // I stopped here
        // await unreadModel.createForUsers()
        const message = await messageModel.create(chatId, payload.id, content)
        let unread: Unread[]

        if(chat.isDm){
            unread = await unreadModel.createForDm(chatId, message.id)
        }
        else {
            // console.log('chatId', chatId, 'message', message)
            unread = await unreadModel.createForGroup(chatId, message.id) // not implemented
        }
        // console.log(unread)
        return {
            sendAfter: {[chatId]: {message, unread}}
        }
    },

    readMsg: async(payload: TokenPayload, msg: Message) => {
        // const _unread = await unreadModel.removeById(unread.id)
        const result = await unreadModel.remove(payload.id, msg.id)
        // const message = await messageModel.getById(unread.messageId)

        return {
            sendBefore: {[msg.chatId]: msg}
        }
    },

    getMessages: async(payload: TokenPayload, chatId: ChatId) => {
        const msgs = await messageModel.getForUser(payload.id, chatId)
        return {
            sendBefore: {[payload.id]: msgs}
        }
    },
    
    ping1: async(payload: TokenPayload, arg: string): Promise<Res<string>> => {
        return {
            sendBefore: {[payload.id]: arg}
        }
    },

}

export default controller