import {Socket} from 'socket.io'
import { ChatId, UserId, TokenPayload, 
    Message, MessageId, SearchResult, DM, 
    Group, 
    DbUser} from '../types/Types'
import db from '../config/db'
import userModel from '../models/users'
// import chatModel from '../models/chats'
import dmModel from '../models/dms'
import groupModel from '../models/groups'
import membershipModel from '../models/memberships'
import messageModel from '../models/messages'
import unreadModel, {Unread, UnreadId} from '../models/unread'

import chatModel, { chatMessages, getHeaderInfo, getMessages, headerInfo, messages, sendMessage } from '../models/chat'
import chatListModel, { dmOthers } from '../models/chatList'
import searchModel from '../models/search'

import { ChatListItem, ChatMessage, HeaderInfo,
    SendReq, SendRes, SearchReq, SearchRes,
    ChatListReq,
    UserInfoReq,
    GroupInfoReq,
    NewGroupReq,
    GroupRemoveReq,
    ChatSelect
 } from '@clientTypes'

export type Res<T> = {
    sendBefore?: {[id: string]: T}
    join?: {[id: UserId]: string}
    leave?: {[id: UserId]: string}
    sendAfter?: {[id: string]: T}
    error?: string
}

const controller = {

    handleChatListReq: async(payload: TokenPayload, req: ChatListReq) => {
        const {id} = payload
        const result: ChatListItem[] = await chatListModel.chatList(id) as ChatListItem[]
        return result
    },

    handleContactsReq: async(payload: TokenPayload) => {
        const result = await dmOthers(payload.id)
        return result
    },

    handleSearchReq: async(payload: TokenPayload, {criteria}: SearchReq) => {
        const result: SearchRes = await searchModel.search(criteria)
        return result 
    },

    handleChatSelectionReq: async(payload: TokenPayload, {chatId}: ChatSelect) => {
        const header: HeaderInfo = await getHeaderInfo(payload.id, chatId)
        const msgs: ChatMessage[] = await getMessages(payload.id, chatId)
        return { header, msgs , chatId}
    },

    handleChatMsgReq: async(payload: TokenPayload, chatId: ChatId) => {
        const msgs: ChatMessage[] = await getMessages(payload.id, chatId)
        return msgs
    },

    handleSendReq: async(payload: TokenPayload, {chatId, content}: SendReq) => {
        const msg = await sendMessage(payload.id, chatId, content)
        return msg
    },

    handleUserInfoReq: async(payload: TokenPayload, {userId}: UserInfoReq) => {
        throw new Error()
    },

    handleGroupInfoReq: async(payload: TokenPayload, {chatId}: GroupInfoReq) => {
        throw new Error()
    },

    handleNewGroupReq: async(payload: TokenPayload, {name}: NewGroupReq) => {
        throw new Error()
    },

    handleGroupRemoveReq: async(payload: TokenPayload, {chatId}: GroupRemoveReq) => {
        throw new Error()
    },


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
                    (select 
                        id as "dmId", 
                        case when "user1Id"=\'${id}\' then "user2Id" else "user1Id" end as "userId"
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
            ,unseen as (
                with msgs as (
                    select m.*, ROW_NUMBER() OVER (PARTITION by "chatId" order by created asc) as rn
                    from (select * from messages) as m
                )
                , counts as (
                    select "chatId", count(id) as count from messages group by "chatId"
                )
                select counts."chatId", counts.count, msgs.rn as first_unread,
                    case when msgs.rn is null then 0 else counts.count-msgs.rn+1 end as "unreadCount"
                from msgs
                right join unread on "messageId"=msgs.id
                full join counts on counts."chatId"=msgs."chatId"
            )
            select content, "chatName", lm."chatId", username, "unreadCount"
            from (select * from last_messages where rn=1) as lm
            join chatnames on chatnames."chatId"=lm."chatId"
            join users on users.id=lm."userId"
            full join unseen on unseen."chatId"=lm."chatId";
        `)
        // console.log(result.rows)
        return result.rows as ChatListItem[]
    },

    getMessagesinChat: async (payload: TokenPayload, chatId: ChatId) => {
        const {id} = payload
        const result = await db.raw(`
            with unseen as (
                select "messageId" from unread where "userId"=\'${id}\' 
            )
            select 
                content, username, m.created,
                case when m."userId"=\'${id}\' then true else false end as "isOnwer",
                case when m.id in (select * from unseen) then true else false end as "unread"
            from (select * from messages where "chatId"=\'${chatId}\') as m
            join users on m."userId"=users.id
            order by m.created asc;
        `)

        return result.rows as ChatMessage[]
    },

    getHeaderInfo: async(payload: TokenPayload, chatId: ChatId) => {
        const {id} = payload 
        const result = await db.raw(`
            with is_private as (
                select "isDm" from chats where id=\'${chatId}\'
            )
            , chatname as (
                select case when "isDm"=true then
                (
                    with dm as (select * from dms where id=\'${chatId}\')
                    , userid as (
                        select case
                            when "user1Id"=\'${id}\'
                            then dm."user2Id"
                            else dm."user1Id"
                        end as "userId"
                        from dm
                    )
                    select username from users where users.id=(select "userId" from userid)
                )
                else 
                (
                    select name from groups where groups.id=\'${chatId}\'
                )
                end as chatname
                from is_private
            )
            -- select * from is_private;
            select chatname as "chatName", "isDm", case when "isDm"=true then 2 else (select count(id) from memberships where "groupId"=\'${chatId}\') end as count
            from is_private, chatname;
        `)
        // console.log(result.rows[0])

        return result.rows[0] as HeaderInfo;
    },

    trySendChat: async(payload: TokenPayload, {chatId, content}: SendReq) => {
        const {id} = payload
        const result = await db.raw(`
            with is_dm as (select "isDm" from chats where id=\'${chatId}\')
            , is_member as (
                select case when (select * from is_dm)=true 
                then 
                (
                    select case when count=0 then false else true end 
                    from (select count(id) from dms where id=\'${chatId}\' and \'${id}\' in ("user1Id", "user2Id"))
                )
                else (
                    select case when count=0 then false else true end
                    from 
                    (select count(id) from memberships where "userId"=\'${id}\' and "groupId"=\'${chatId}\')
                ) end
            )
            , to_insert as (
                select \'${id}\'::uuid as "userId", \'${chatId}\'::uuid as "chatId", \'${content}\' as content
                where (select * from is_member)
            )
            insert into messages ("userId", "chatId", "content")
            (select * from to_insert)
            returning *;
        `) 
        
        console.log(result.rows[0])
        return result.rows[0] as Message
    },

    getAllChatIds: async(payload: TokenPayload) => {
        const {id} = payload
        const result = await db.raw(`
            with dmids as (select id from dms where \'${id}\' in ("user1Id", "user2Id"))
            , groupids as (select "groupId" as id from memberships where "userId"=\'${id}\')
            (select * from dmids) union (select * from groupids);
        `)

        console.log(result.rows)
        return result.rows as {id: ChatId}[]
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

    // removeGroup: async(payload: TokenPayload, chatId: ChatId) => {
    //     const membership = await membershipModel.get(payload.id, chatId)

    //     if(!membership || !membership.isAdmin){
    //         return {
    //             sendBefore: {[payload.id]: 'not authorized'}
    //         }
    //     }

    //     await chatModel.remove(chatId)

    //     return {
    //         sendBefore: {[chatId]: chatId},
    //     }
    // },

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
    // msg: async(payload: TokenPayload, arg: {chatId: ChatId, content: string}): Promise<Res<{message: Message, unread: Unread[]}>> => {
    // // msg: async(payload: TokenPayload, arg: {chatId: ChatId, content: string}) => {
    //     const {chatId, content} = arg
    //     const chat = await chatModel.getById(chatId)
    //     const membership = await membershipModel.get(payload.id, chatId)

    //     if(!chat || (!chat.isDm && !membership)){
    //         return {
    //             // sendBefore: {[payload.id]: 'not authorized'}
    //             error: 'not authorized',
    //         }
    //     }

    //     // I stopped here
    //     // await unreadModel.createForUsers()
    //     const message = await messageModel.create(chatId, payload.id, content)
    //     let unread: Unread[]

    //     if(chat.isDm){
    //         unread = await unreadModel.createForDm(chatId, message.id)
    //     }
    //     else {
    //         // console.log('chatId', chatId, 'message', message)
    //         unread = await unreadModel.createForGroup(chatId, message.id) // not implemented
    //     }
    //     // console.log(unread)
    //     return {
    //         sendAfter: {[chatId]: {message, unread}}
    //     }
    // },

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