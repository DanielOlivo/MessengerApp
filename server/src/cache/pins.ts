import { Cache } from "./cache";
import { UserId } from "shared/src/Types";
import { ChatPin } from "../models/models";
import pinModel from '../models/pins'

const queries = {
    id: (id: string) => `id=${id}`,
    ofUser: (userId: UserId) => `ofuser=${userId}`
}

export class PinCache extends Cache<ChatPin> {

    constructor(fn: (pin: ChatPin) => string) {
        super(fn)
    }

    getUserPins = async (userId: UserId) => await this.get(
        queries.ofUser(userId),
        async () => await pinModel.getByUserId(userId),
        (pin: ChatPin) => [ queries.id(pin.id), queries.ofUser(pin.userId)]
    )

    insertPin = (pin: ChatPin) => this.insert(
        pin,
        [ queries.id(pin.id), queries.ofUser(pin.userId) ],
        async () => await pinModel.create(pin)
    )

    removePin = async (id: string) => this.removeById(
        id,
        async () => await pinModel.remove(id)
    )

}