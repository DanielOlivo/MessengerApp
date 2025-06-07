import db from '@config/db'
import { ChatInfo, ChatPin, Message, User } from '@models/models'
import { Chat } from '@models/models'
import { faker } from '@faker-js/faker/.'
import dayjs from 'dayjs';
import { v4 as uuid } from 'uuid'
import { Membership } from '@models/models'
import { hash } from 'bcryptjs'


/**  I'm trying to make life easier */
export class DbUtils {

    users: User[] = []
    chats: Chat[] = []
    infos: ChatInfo[] = []
    memberships: Membership[] = []
    pins: ChatPin[] = []
    messages: Message[] = []
    password = '1234'


    initTimestamp = dayjs().subtract(10, 'days')

    async addRandomUsers(count: number = 1) {
        const result: User[] = []
        const hashed = await hash(this.password, 10)
        for(let i = 0; i < count; i++){
            const newUser: User = {
                id: uuid(),
                username: faker.internet.username(),
                hash: hashed,
                iconSrc: '',
                created: this.initTimestamp.toDate()
            }
            this.users.push(newUser)
            await db('users').insert(newUser)
            result.push(newUser)
        }    
        return result
    }


    async getDm(userId1: string, userId2: string){
        const chat = await this.getChat(false)
        const membership1 = await this.getMembership(userId1, chat.id)
        const membership2 = await this.getMembership(userId2, chat.id)
        return { chat, membership1, membership2 }
    }

    async getGroup(userIds: string[], name: string = faker.lorem.word()){
        const chat = await this.getChat(true)
        const info = await this.getChatInfo(chat.id, name) 
        const groupMemberships = []
        for(const id of userIds){
            const membership = await this.getMembership(id, chat.id)
            groupMemberships.push(membership)
        }
        return {chat, info, memberships: groupMemberships }
    }

    async addRandomMessages(chatId: string, count: number = 3): Promise<Message[]> {
        const chatMemberships = this.memberships
            .filter(m => m.chatId === chatId)
        const result = []
        for( let i = 0; i < count; i++){
            for(const member of chatMemberships){
                const content = faker.lorem.sentence()
                const msg = await this.getMessage(member.userId, chatId, content) 
                result.push(msg)
            }
        }
        return result
    }

    async clean(){
        this.users = []
        this.chats = []
        this.infos = []
        this.memberships = []
        this.pins = []
        this.messages = []
        
        await db('users').del()
        await db('chats').del()
        await db('chatinfo').del()
        await db('memberships').del()
        await db('messages').del()
        await db('pins').del()
    }

    async getChat(isGroup: boolean, created: Date = dayjs().toDate()): Promise<Chat> {
        const chat: Chat = { id: uuid(), isGroup, created }
        this.chats.push(chat)
        await db('chats').insert(chat)
        return chat
    }

    async createPin(userId: string, chatId: string): Promise<ChatPin> {
        const pin: ChatPin = { id: uuid(), userId, chatId }
        this.pins.push(pin)
        await db('pins').insert(pin)
        return pin
    }

    async getMembership(userId: string, chatId: string, isAdmin = false, created: Date = dayjs().toDate()): Promise<Membership>  {
        const membership: Membership =  { id: uuid(), userId, chatId, isAdmin, created}
        this.memberships.push(membership)
        await db('memberships').insert(membership) 
        return membership
    }

    async getMessage(userId: string, chatId: string, content: string): Promise<Message> {
        const msg: Message = { id: uuid(), userId, chatId, content, timestamp: dayjs().toDate() }
        this.messages.push(msg)
        await db('messages').insert(msg)
        return msg
    }

    async getChatInfo(chatId: string, name: string){
        const info: ChatInfo = {
            id: uuid(),
            chatId,
            name, 
            iconSrc: ''
        }
        await db('chatinfo').insert(info)
        return info
    }
}
