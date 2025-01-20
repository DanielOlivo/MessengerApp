process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll} from '@jest/globals'
import request from 'supertest'
import db from '../config/db'
import app from '../app'
import { Credentials, RegCredentials } from '../types/Types'

describe('auth', () => {
    
    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        await db.seed.run()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    test("registration: john.doe", async() => {
        const payload: RegCredentials = {
            username: 'john.doe',
            password: 'password',
            bio: 'hi'
        }

        const res = await request(app)
            .post('/api/user/register')
            .send(payload)

        expect(res.status).toEqual(200)

        const {id, username, created, bio } = res.body       
        expect(id).toBeDefined()
        expect(username).toBeDefined()
        expect(created).toBeDefined()
        expect(bio).toBeDefined()

        expect(username).toEqual(payload.username)
        expect(bio).toEqual('hi')
    })

    test('login: john.doe', async() => {
        const payload: Credentials = {
            username: 'john.doe',
            password: 'password',
        }

        const res = await request(app)
            .post('/api/user/login')
            .send(payload)
        
        expect(res.status).toEqual(200)

        const {id, username, token} = res.body
        expect(id).toBeDefined()
        expect(username).toEqual('john.doe')
        expect(token).toBeDefined()
    })

    test('login: john.doe mistyped username', async() => {
        const payload: Credentials = {
            username: 'johhn.doe',
            password: 'password',
        }

        const res = await request(app)
            .post('/api/user/login')
            .send(payload)
        
        expect(res.status).toEqual(404)
    })

    test('login: john.doe mistyped password', async() => {
        const payload: Credentials = {
            username: 'john.doe',
            password: 'passsword',
        }

        const res = await request(app)
            .post('/api/user/login')
            .send(payload)
        
        expect(res.status).toEqual(404)
    }),

    test('register: invalid password length', async() => {
        const payload: RegCredentials = {
            username: 'user4',
            password: 'sss'    
        }

        const res = await request(app)
            .post('/api/user/register')
            .send(payload)

        expect(res.status).toEqual(400)
    })

    test('register: invalid bio (is number)', async() => {
        const payload = {
            username: 'user4',
            password: 'sss',
            bio: 10
        }

        const res = await request(app)
            .post('/api/user/register')
            .send(payload)

        expect(res.status).toEqual(400)
    })

})
