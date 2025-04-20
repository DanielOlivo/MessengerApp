import db from "../config/db";
import { getCache } from "../cache1";
import { UserId } from "shared/src/Types";
import { ChatPin } from "../models/models";
import pinModel from '../models/pins'

const cache = getCache<ChatPin>(p => p.id)

const getUserPins = async (userId: UserId) => await cache.get(
    'user=' + userId,
    () => pinModel.getByUserId(userId),
    (pin: ChatPin) => new Set( [`id=${pin.id}`, `user=${userId}`] )
)

const updatePin = (pin: ChatPin) => cache.update(
    pin,
    new Set( [`id=${pin.id}`, `user=${pin.userId}`] ),
    (p: ChatPin) => db('pins').where({id: p.id}).update(pin)
)

export default {
    getUserPins,
    updatePin
}