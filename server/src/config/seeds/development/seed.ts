import type {Knex} from 'knex'
import userModel from '@models/users'
import { hash } from 'bcrypt'
import { v4 as uuid } from 'uuid'

import { TokenPayload } from '@shared/Types'
import jwt from 'jsonwebtoken'

export async function seed(knex: Knex): Promise<void> {
    await knex('users').del()

    const user1 = await getUser('user1', '1234')
    const user2 = await getUser('user2', '1234')
    const user3 = await getUser('user3', '1234')
    const john = await getUser('john.doe', '1234')

    const dmChat = {id: uuid(), isDm: true}
    const dm = {id: dmChat.id, user1Id: user1.id, user2Id: user2.id}
    
    const dudesChat = {id: uuid(), isDm: false}
    const dudes = {id: dudesChat.id, name: 'dudes'}

    const membership1 = {id: uuid(), groupId: dudes.id, userId: user1.id}
    const membership2 = {id: uuid(), groupId: dudes.id, userId: user2.id}
    const membership3 = {id: uuid(), groupId: dudes.id, userId: user3.id}

    const dmMsg1 = {id: uuid(), userId: user1.id, chatId: dm.id, content: 'hey'}
    const dmMsg2 = {id: uuid(), userId: user2.id, chatId: dm.id, content: 'whats up'}

    const dudesMsg1 = {id: uuid(), userId: user1.id, chatId: dudes.id, content: 'first'}
    const dudesMsg2 = {id: uuid(), userId: user2.id, chatId: dudes.id, content: 'second'}
    const dudesMsg3 = {id: uuid(), userId: user3.id, chatId: dudes.id, content: 'third'}
    // three users

    await knex.transaction(async trx => {
        await trx('users').insert([user1, user2, user3, john])
        await trx('chats').insert([dmChat, dudesChat])
        await trx('dms').insert([dm])
        await trx('groups').insert([dudes])
        await trx('memberships').insert([membership1, membership2, membership3])
        await trx('messages').insert([
            dmMsg1, dmMsg2,
            dudesMsg1, dudesMsg2, dudesMsg3
        ])
    })

}

function getDateGen() {
    const now = Date.now()
    let counter = 0
    return function getDate() {
        return new Date(now - 1000 * 60 * 60 * (24 * 200 - (12 * counter++)))
    }
}

async function getUser(username: string, password: string){
    const saltRounds = 10
    const hashed = await hash(password, saltRounds)
    return {id: uuid(), username, hashed}
}