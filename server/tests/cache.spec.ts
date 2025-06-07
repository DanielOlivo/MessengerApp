process.env.NODE_ENV = 'test'

import {v4 as uuid} from 'uuid'
import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import db from "@config/db"
import { create, getCache, load, Status } from "@cache/cache_toRemove"
import { DbUser } from '@shared/Types'
import UserModel from '@models/UserModel'


describe('cache tests', () => {
    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    test('create', async () => {
        const _user = {id: uuid(), username: "user100", hashed: "hashed", created: new Date()}
        const getKeyFn = ({id}: DbUser) => {return {id}}
        const user = create<DbUser, 'id' | 'username' | 'created'>(_user, ['id', 'username', 'created'], 'users', getKeyFn)

        expect(user).toBeDefined()
        expect(user.id.get()).toEqual(_user.id)
        expect(user.username.get()).toEqual(_user.username)
        expect(user.hashed.get()).toEqual(_user.hashed)

        const plained = user.getPlain()
        expect(plained).toEqual(_user)
        expect(user.getStatus()).toEqual('create')

        user.hashed.set('updated password hash')
        expect(user.hashed.get()).toEqual('updated password hash')
        expect(user.getStatus()).toEqual('create')

        await db.transaction(async trx => {await user.push(trx)})

        expect(user.getStatus()).toEqual('none')

        const extracted = await db('users').where({id: _user.id}).select('*').first() as DbUser
        expect(extracted.username).toEqual(user.username.get())
        expect(extracted.hashed).toEqual(user.hashed.get())
    })

    test('fromDb', async() => {
        const getKeyFn = ({id}: DbUser) => { return  {id}}
        const user = await load<DbUser, 'id' | 'username' | 'created'>({username: 'user1'}, ['id', 'username', 'created'], 'users', getKeyFn)

        expect(user).toBeDefined()
        expect(user.username.get()).toEqual('user1')
        expect(user.hashed.get()).toEqual('hashed')
    })

    test('cache', () => {
        const cache = getCache<DbUser, 'id' | 'username'>(new Date(), )
    })

    test('sanity check', () => expect(1).toEqual(1))

    return
    test('UserModel: fromDb', async() => {
        const user = await UserModel.fromDb('username', 'user1')
        const asModel: DbUser = user!
        console.log(asModel)
        expect(user).toBeDefined()

        user!.hashed = 'updated hashed!!!!' 
        console.log('status', user!.status)
        console.log('hashed', user!.hashed)

        await db.transaction(async (trx) => await user!.push(trx))

        const updUser = await UserModel.fromDb('username', 'user1') as UserModel
        console.log('updUser', updUser.id)
        console.log(updUser?.hashed)
    })


    return 

})

function getUser(username: string): DbUser {
    return {id: uuid(), username, created: new Date(), hashed: 'hashed'}
}