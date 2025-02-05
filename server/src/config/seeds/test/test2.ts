process.env.NODE_ENV='test'

import { Knex } from "knex";
import {v4 as uuid} from 'uuid'

export async function seed(knex: Knex): Promise<void> {

    // const alice = {id: uuid(), username: 'alice.green', hashed: 'hashed'}
    // const bob = {id: uuid(), username: 'bob.blue', hashed: 'hashed'}
    // const jim = {id: uuid(), username: 'jim.red', hashed: 'hashed'}
    // const alex = {id: uuid(), username: 'alex.white', hashed: 'hashed'}

    // const aliceJimChat = {id: uuid(), isDm: true}
    // const aliceAlexChat = {id: uuid(), isDm: true}

    // const aliceJimDm = {id: aliceJimChat.id, user1Id: alice.id, user2Id: jim.id}
    // const aliceAlexDm = {id: aliceAlexChat.id, user1Id: alice.id, user2Id: alex.id}

    // const group1Chat = {id: uuid(), isDm: false}
    // const group2Chat = {id: uuid(), isDm: false}

    // return knex.transaction(async trx => {
    //     await trx('users').insert([alice, bob, jim, alex])
    //     await trx('chats').insert([aliceAlexChat, aliceJimChat])
    //     await trx('dms').insert([aliceJimDm, aliceAlexDm])
    // })    
}