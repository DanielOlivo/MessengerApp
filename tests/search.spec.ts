process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import db from '../config/db'
import { search } from '../models/search'
import { UserId } from '../types/Types'
import { SearchReq, UserInfo } from '../types/Client'

describe('searh query', () => { 

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    test('user1', async () => {
        const [{id, username}] = await search('user1') 
        expect(id).toBeDefined()
        expect(username).toEqual('user1')
        
    })

    test('user2', async () => {
        const [{id, username}] = await search('user2') 
        expect(id).toBeDefined()
        expect(username).toEqual('user2')
    })

    test('user', async() => {
        const users = await search('user')
        expect(users.length).toEqual(4)
    })

})

// function contacts(userId: UserId){
//     return db.with('chats', db('dms').where({user1Id: userId}).orWhere({user2Id: userId}).select("user1Id", "user2Id"))
//         .with()
// }