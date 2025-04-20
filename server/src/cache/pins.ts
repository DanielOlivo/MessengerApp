import { getCache } from "../cache1";
import { ChatPin } from "../models/models";
import pinModel from '../models/pins'

const cache = getCache<ChatPin>(p => p.id)

const getUserPins = async (userId: UserId) => await cache.get(
    'user=' + userId,
    () => pinModel.getByUserId(userId),
    (pin: ChatPin) => new Set( [`id=${pin.id}`, `user=${userId}`] )
)

export default {
    getUserPins
}