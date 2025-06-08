import { describe, it, expect, beforeAll, afterAll, afterEach, jest, beforeEach } from '@jest/globals'
import db from '../config/db'
import { PinCache } from './pins'
import { DbUtils } from '../utils/db'
import { ChatPin } from '@models/models'
import { v4 as uuid } from 'uuid';

describe('pinCache', () => {

    const utils = new DbUtils()

    beforeAll(async () => {
        await db.migrate.rollback()
        await db.migrate.latest()
    })

    afterAll(async () => {
        await db.migrate.rollback()
    })

    it('toggle and untoggle', async() => {
        const [user1, user2, user3] = await utils.addRandomUsers(3)
        expect(user1).toBeDefined()
        expect(user2).toBeDefined()
        expect(user3).toBeDefined()

        const { chat: dm1 } = await utils.getDm(user1.id, user2.id)
        const { chat: dm2 } = await utils.getDm(user1.id, user3.id)
        expect(dm1).toBeDefined()
        expect(dm2).toBeDefined()

        const pin1 = await utils.createPin(user1.id, dm1.id)
        expect(pin1).toBeDefined()

        const cache = new PinCache()

        {
            const pins = await cache.getUserPins(user1.id)
            expect(pins).toBeDefined()
            expect(pins.length).toEqual(1)

            expect(cache.items.size).toEqual(1)
        }

        const pin2: ChatPin = { id: uuid(), userId: user1.id, chatId: dm2.id }
        cache.insertPin(pin2)
        expect(cache.items.size).toEqual(2)

        {
            const pins = await cache.getUserPins(user1.id)
            expect(pins.length).toEqual(2)
        }

        cache.removePin(pin2.id)
        expect(cache.items.size).toEqual(1)        

    })

})