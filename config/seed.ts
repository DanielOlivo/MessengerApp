import type {Knex} from 'knex'
// import userModel from '@models/users'
// import dmModel from '@models/dms'
// import groupModel from '@models/groups'
// import messageModel from '@models/messages'
// import membershipModel from '@models/memberships'

import userModel from '../models/users'
import dmModel from '../models/dms'
import groupModel from '../models/groups'
import messageModel from '../models/messages'
import membershipModel from '../models/memberships'
import unreadModel from '../models/unread'
import { hash } from 'bcrypt'

import { TokenPayload } from '../types/Types'
import jwt from 'jsonwebtoken'
import db from './db'

// export async function seed(knex: Knex): Promise<void> {

//     const getDate = getDateGen()
//     const saltRounds = 10

//     // three users
//     const hashed1 = await hash('1234', saltRounds)

//     // await db.transaction(async trx => {
//     //     trx('users').del()
//     // })
//     await db('users').del()
//     return db('users').insert({username: 'user1', hashed: 'hashed'})
//     // return db.transaction(async trx => {
//     //     trx('users').insert([
//     //         {username: 'user1', hashed: 'hashed'}
//     //     ])
//     //     trx.commit()
//     // })
// }

//     // const user1 = await userModel.create('user1', hashed1, "i'm user1")
//     const user2 = await userModel.create('user2', hashed1, "i'm user2")
//     const user3 = await userModel.create('user3', hashed1, "i'm user3")
//     return

//     const user4 = await userModel.create('user4', 'hashed', "I'm fourth and has no access to chats")

//     // one dm
//     const dm12 = await dmModel.create(user1.id, user2.id)

//     // one group
//     const {group, membership: membership1} = await groupModel.create(user1.id, 'dudes', getDate())
//     const membership2 = await membershipModel.create(user2.id, group.id, false, getDate())
//     const membership3 = await membershipModel.create(user3.id, group.id, false, getDate())

//     // messages
//     const msg1 = await messageModel.create(dm12.id, user1.id, 'hey', getDate())
//     const msg2 = await messageModel.create(dm12.id, user1.id, 'whats up', getDate())

//     const msg3 = await messageModel.create(group.id, user1.id, 'first', getDate())
//     const msg4 = await messageModel.create(group.id, user2.id, 'second', getDate())
//     const msg5 = await messageModel.create(group.id, user3.id, 'third', getDate())

//     const unread1 = await unreadModel.createForUser(user1.id, msg4.id)


//     {
//         const username = 'john.doe'
//         const password = '1234'
//         const saltRounds = 10
//         const hashed = await hash(password, saltRounds)
//         const john = await userModel.create(username, hashed)
//     }


//     //gen token for testing
//     const payload: TokenPayload = {
//         id: user1.id,
//         username: user1.username
//     }

//     const token = jwt.sign(payload, process.env.JWT_SECRET as string)
//     console.log('use token:')
//     console.log(token)

// }

function getDateGen() {
    const now = Date.now()
    let counter = 0
    return function getDate() {
        return new Date(now - 1000 * 60 * 60 * (24 * 200 - (12 * counter++)))
    }
}