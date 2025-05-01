import type {Knex} from 'knex'
import { faker } from '@faker-js/faker'
import { hash } from 'bcryptjs';
import { v4 as uuid } from 'uuid'
import dayjs from 'dayjs';
import { Chat,Membership, Message } from '../../../models/models';

export async function seed(knex: Knex): Promise<void> {

    const hash1 = await hash('password', 10)
    let initTimestamp = dayjs().subtract(10, 'days')
    const users = ['user1', 'user2', 'user3', 'user4'].map(name => ({
        id: uuid(),
        username: name,
        hash: hash1,
        created: initTimestamp.toDate()
    }))

    const dms: Chat[] = []
    const mems: Membership[] = []
    const msgs: Message[] = []

    for(let i = 1; i < users.length; i++){
        
        const u1 = users[i - 1]
        const u2 = users[i]

        initTimestamp = initTimestamp.add(1, 'hour')
        const dm: Chat = { id: uuid(), isGroup: false, created: initTimestamp.toDate() }
        dms.push(dm)

        const memberships: Membership[] = [u1, u2].map(user => 
            ({id: uuid(), chatId: dm.id, userId: user.id, isAdmin: false, created: initTimestamp.toDate()}))
        memberships.forEach(m => mems.push(m))
        
        const messages: Message[] = Array.from({length: 10}, (_,i) => ({
            id: uuid(),
            chatId: dm.id,
            userId: i % 2 === 0 ? u1.id : u2.id,
            content: faker.lorem.sentence(),
            timestamp: initTimestamp.add(i,'hour').toDate()
        }))
        messages.forEach(m => msgs.push(m))
    }


    await knex.transaction(async trx =>  {
        await trx('users').insert(users)
        await trx('chats').insert(dms)
        await trx('memberships').insert(mems)
        await trx('messages').insert(msgs)
    }) 



}

// function getDateGen() {
//     const now = Date.now()
//     let counter = 0
//     return function getDate() {
//         return new Date(now - 1000 * 60 * 60 * (24 * 200 - (12 * counter++)))
//     }
// }

// async function getUser(username: string, password: string){
//     const saltRounds = 10
//     const hashed = await hash(password, saltRounds)
//     return {id: uuid(), username, hashed}
// }