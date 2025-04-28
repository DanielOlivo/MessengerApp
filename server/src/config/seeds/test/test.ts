process.env.NODE_ENV='test'

import { faker } from '@faker-js/faker'
import { v4 as uuid } from 'uuid'
import { Knex } from "knex";

// import userModel from '../../../models/users'
import { Chat, ChatPin, Membership, Message, User } from "../../../models/models";
import dayjs from 'dayjs';
import { hash } from 'bcryptjs';

export async function seed(knex: Knex): Promise<void> {

    let initTimestamp = dayjs().subtract(10, 'days')

    const hash1 = await hash('password', 10)
    const user1: User = {
        id: uuid(),
        username: 'user1',
        hash: hash1,
        iconSrc: '',
        created: initTimestamp.toDate()
    }

    const user2: User = {
        id: uuid(),
        username: 'user2',
        hash: hash1,
        iconSrc: '',
        created: initTimestamp.toDate()
    }

    const user3: User = {
        id: uuid(),
        username: 'user3',
        hash:'hash',
        iconSrc: '',
        created: initTimestamp.toDate()
    }

    const user4: User = {
        id: uuid(),
        username: 'user4',
        hash:'hash',
        iconSrc: '',
        created: initTimestamp.toDate()
    }

    const users = [user1, user2, user3, user4]
    for(const user of users){
        await knex('users').insert(user)
    }

    for(let i = 1; i < users.length; i++){
        
        const u1 = users[i - 1]
        const u2 = users[i]

        initTimestamp = initTimestamp.add(1, 'hour')
        const dm: Chat = { id: uuid(), isGroup: false, created: initTimestamp.toDate() }

        const memberships: Membership[] = [u1, u2].map(user => 
            ({id: uuid(), chatId: dm.id, userId: user.id, isAdmin: false, created: initTimestamp.toDate()}))

        // const pins: ChatPin[] = [u1, u2].map(user => 
        //     ({id: uuid(), userId: user.id, chatId: dm.id}))
            // ({id: uuid(), userId: user.id, chatId: dm.id, pinned: false}))
        
        const messages: Message[] = Array.from({length: 10}, (_,i) => ({
            id: uuid(),
            chatId: dm.id,
            userId: i % 2 === 0 ? u1.id : u2.id,
            content: faker.lorem.sentence(),
            timestamp: initTimestamp.add(i,'hour').toDate()
        }))

        await knex('chats').insert(dm)
        await knex('memberships').insert(memberships)
        // await knex('pins').insert(pins)
        await knex('messages').insert(messages)
    }





};