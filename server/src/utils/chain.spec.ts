import { describe, it, expect, beforeAll, afterAll, afterEach, jest, beforeEach } from "@jest/globals";
import { wait } from "./wait";
import { DbUtils } from "./db";
import db from "@config/db";
import { MessageCache } from "@cache/messages";
import { Message } from "@models/models";
import { v4 as uuid } from 'uuid'
import { faker } from "@faker-js/faker/.";
import dayjs from "dayjs";
import messageModel from '../models/messages'

describe('chaining', () => {

    const utils = new DbUtils()
    const messageCache = new MessageCache(m => m.id)

    beforeAll(async() => {
        await db.migrate.rollback()
        await db.migrate.latest()
    })

    beforeEach(async () => {
        await utils.clean()

        messageCache.reset()
    })

    it('queue', async () => {

        const queue = new AsyncTaskQueue()
        const init = Array.from({length: 10}, (_, i) => i)
        const result = await Promise.all(init.map(i => queue.enqueue(() => getx2(i))))
        expect(result.length).toEqual(init.length)
    })

    it('writing messages', async () => {
        const queue = new AsyncTaskQueue()
        const [user1, user2] = await utils.addRandomUsers(2)
        const { chat } = await utils.getDm(user1.id, user2.id)

        const messages = Array.from({length: 1000}, (_, i) => {
            const userId = i % 2 === 0 ? user1.id : user2.id
            const msg: Message = {
                id: uuid(), 
                chatId: chat.id, 
                userId, 
                content: faker.lorem.sentence(), 
                timestamp: dayjs().toDate()
            }
            return msg
        })   

        await Promise.all(
            messages.map(m => 
                (async () => {
                    const fn = async() => {
                        await messageModel.create(m)
                        return m
                    }
                    console.log('running test for id', m.id)
                    const result = await queue.enqueue(fn)
                    expect(result.id).toEqual(m.id)
                })()
        ))

        console.log('checking records')
        const records = await db('messages').select('*')
        expect(records.length).toEqual(messages.length)
    })

})


class AsyncTaskQueue {

    private last: Promise<any> = Promise.resolve()
    public enqueue<T>(task: () => Promise<T>): Promise<T> {

        const taskPromise = this.last.then(() => task())
        this.last = taskPromise.catch(() => {})
        return taskPromise
    }
}

async function getx2(x: number){
    await wait(100 + 100 * Math.floor(Math.random()))
    return x * 2
}