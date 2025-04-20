import db from "../config/db";
import { UserId } from "shared/src/Types";
import { ChatPin } from "./models";

const model = {

    create: async(pin: ChatPin): Promise<void> => {
        await db('pins').insert(pin)
    },

    update: async(pin: ChatPin): Promise<void> => {
        await db('pins').where({id: pin.id}).update(pin)
    },

    remove: async(id: string): Promise<void> => {
        await db('pins').where({id}).del()
    },

    getByUserId: async (userId: UserId): Promise<ChatPin[]> => {
        const pins = await db('pins').where({userId})
        return pins
    }

}

export default model