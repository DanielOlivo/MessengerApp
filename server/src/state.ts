import { v4 as uuid } from 'uuid'
import { UserId, ChatId, MessageId } from "@shared/Types";
import { Message } from "@shared/Message";
import { getRandom as getRandomUserInfo, UserInfo } from "shared/src/UserInfo";
import { faker } from '@faker-js/faker'
import dayjs from 'dayjs';

export type ItemStatus = 'none' | 'created' | 'updated' | 'removed'




/*

*/

export interface MessageModel {
    id: string
    sender: UserId
}

export interface MembershipModel {
    id: string
    chatId: ChatId
    userId: UserId
    created: number
}


export interface ChatState {
    chatId: ChatId
    messages: Message[] // but need to be tracked
    members: MembershipModel[]
}



export function getTrackedMap<T,K>(getterFn: (key: T) => Promise<K | undefined>){
    const map = new Map<T,K>()

    const reqTimestamps = new Map<T, number>()
    const status = new Map<T, ItemStatus>()

    const now = () => dayjs().valueOf()

    const has = async (key: T): Promise<boolean> => {
        if(map.has(key)){
            return true
        }
        else if(status.has(key) && status.get(key) === 'removed'){
            return false
        }
        const item = await getterFn(key)
        if(!item){
            return false
        }
        reqTimestamps.set(key, now())
        map.set(key, item)
        return true
    }

    const get = async (key: T): Promise<K> => {
        let item: K 
        if(!map.has(key)){
            const _item = await getterFn(key)
            if(!_item){
                throw new Error('get function recevied undefined; use has to make sure if item exists')
            }
            item = _item
        }
        else {
            item = map.get(key)!
        }
        reqTimestamps.set(key, now())
        return item
    }

    const getStatus = (key: T) => status.get(key)

    const create = (key: T, value: K) => {
        reqTimestamps.set(key, now())
        map.set(key, value)
        status.set(key, 'created')
    }

    // how to maintain entries which are one to many db records? this doesn't help
    const update = async (key: T, fn: (value: K) => K) => {
        const v = await get(key)
        if(!v){
            throw new Error('requested item does not exist; use has to check')
        }
        const updated = fn(v)
        map.set(key, updated)
        status.set(key, 'updated')
        reqTimestamps.set(key, now())
    }

    const remove = (key: T) => {
        map.delete(key)
        status.set(key, 'removed')    
    }

    const getRequestTimestamp = (key: T) => reqTimestamps.get(key)

    return { has, get, create, update, remove, map, getRequestTimestamp, getStatus }
}

export type TrackedMap<T,K> = ReturnType<typeof getTrackedMap<T,K>>


export interface ServerState {

    // one to one // one key access
    users:              TrackedMap<UserId, UserInfo>       // all users
    messages:           TrackedMap<MessageId, Message>      // contains all the messages


    // one to many // two key access

    // it is not a thing
    chatMessageIds:     TrackedMap<ChatId, MessageId[]>     // contains all the chats    

    members:            TrackedMap<ChatId, Set<UserId>>
    admins:             TrackedMap<ChatId, Set<UserId>>       // for groups only 

    // auxiliary data
    groups:             Set<ChatId>
}






export function getNonTrackedState() {

    const getEmpty = () => ({
        users: new Map<UserId, UserInfo>(),
        messages: new Map<MessageId, Message>(),
        chatMessageIds: new Map<ChatId, MessageId[]>(),
        members: new Map<ChatId, Set<UserId>>(),
        groups: new Set<ChatId>(),
        admins: new Map<ChatId, Set<UserId>>()
    })
    
    const state = getEmpty()

    const createRandomUsers = (count: number = 10) => {
        return Array.from({length: count}, () => {
            const info = getRandomUserInfo()
            state.users.set(info.id, info)
            return info.id
        })
    }

    const createRandomDms = () => {
        const users = Array.from( state.users.values() )
        const ids = []
        for( let i = 1; i < users.length; i++ ){
            const info1 = users[i - 1]
            const info2 = users[i]

            const chatId = uuid()
            state.members.set(chatId, new Set( [info1.id, info2.id] ))

            const initTimestamp = dayjs().subtract(10, 'days').valueOf()
            state.chatMessageIds.set(chatId, []) 

            for(let j = 0; j < 10; j++ ){
                const message: Message = {
                    messageId: uuid(),
                    chatId,
                    content: faker.lorem.sentence(),
                    timestamp: initTimestamp + 1000 * 60 * 60 * Math.floor(Math.random() * 2) * j,
                    sender: Math.random() > 0.5 ? info1.id : info2.id 
                }
                state.chatMessageIds.get(chatId)?.push(message.messageId)
                state.messages.set(message.messageId, message)
            }
            ids.push(chatId)
        }
        return ids
    }

    return { state, createRandomUsers, createRandomDms }
}









export function getEmpty(): ServerState {
    return {
        users: getTrackedMap<UserId, UserInfo>(dummyUserInfoGetter),
        messages: getTrackedMap<MessageId, Message>(dummyMessageGetter),
        chatMessageIds: getTrackedMap(),
        members: getTrackedMap(),
        groups: getTrackedMap(),
        admins: getTrackedMap()
    }
}

async function dummyUserInfoGetter(id: UserId): Promise<UserInfo> {
    return Promise.resolve({
        id,
        name: faker.internet.username(),
        iconSrc: ''
    })
}

// it is invonvinient
async function dummyMessageGetter(id: MessageId): Promise<Message> {
    return {
        messageId: id,
        chatId: uuid(),
        sender: uuid(),
        content: faker.lorem.sentence(),
        timestamp: dayjs().subtract(2, 'days').valueOf()
    }
}