process.env.NODE_ENV = 'test'

import {describe, test, expect, beforeAll, afterAll, beforeEach} from '@jest/globals'
import request from 'supertest'
import db from '@config/db'
import app from '../src/app'
import { Credentials, RegCredentials } from '../../shared/src/Types'
import { faker } from '@faker-js/faker/.'

describe('auth', () => {

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
        // await db.seed.run()
    })

    afterAll(async() => {
        await db.migrate.rollback()
    })

    beforeEach(async () => {
        await db('users').del()
    })

    test("registration and login", async() => {
        const payload: RegCredentials = {
            username: faker.internet.username(),
            password: 'password',
            bio: 'hi'
        }

        const res = await request(app)
            .post('/api/user/register')
            .send(payload)

        expect(res.statusCode).toEqual(200)

        const payload2: Credentials = {
            username: payload.username,
            password: 'password',
        }

        const res2 = await request(app)
            .post('/api/user/login')
            .send(payload2)
        
        expect(res2.status).toEqual(200)

        const {id, username, token} = res2.body
        expect(id).toBeDefined()
        expect(username).toEqual(payload.username)
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
    })

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

    // test('just get', async() => {
    //     const res = await request(app).get('/')

    //     expect(res.status).toEqual(200)
    // })

})
