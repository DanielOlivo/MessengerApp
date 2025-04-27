import { v4 as uuid } from 'uuid'
import db from "../config/db";
import { getCache } from "../cache1";
import { UserId, ChatId } from "shared/src/Types";
import { ChatPin } from "../models/models";

const queries = {
    id: (id: string) => `id=${id}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`
}

const cache = getCache<ChatPin>(p => p.id)

const getUserPins = async (userId: UserId) => await cache.get(
    queries.ofUser(userId),
    () => db('pins').where({userId}).select('*'),
    (pin: ChatPin) => new Set( [ queries.id(pin.id), queries.ofUser(pin.userId)] )
)

const createPin = (userId: UserId, chatId: ChatId) => {
    const item: ChatPin = {id: uuid(), userId, chatId}
    cache.insert(
        item,
        new Set( [ queries.id(item.id), queries.ofUser(userId) ] ),
        async (i: ChatPin) => await db('pins').insert(i)
    )
}

const removePin = (pin: ChatPin) => cache.remove(
    pin,
    (i: ChatPin) => db('pins').where({id: i.id}).del()
)

export function getPinCache(){
    return {
        getUserPins,
        cache,
        createPin,
        removePin
    }
}