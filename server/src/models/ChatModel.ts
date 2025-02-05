import {v4 as uuid} from 'uuid'
import db from "@config/db"
import { Chat } from "@shared/Types"

class ChatModel {
    private _id: string
    private _isDm: boolean
    private _created: Date

    private constructor(id: string, isDm: boolean, created: Date){
        this._id = id
        this._isDm = isDm
        this._created = created
    }

    public get id() { return this._id }
    public get isDm() { return this._isDm }
    public get created() { return this._created }

    public static create(isDm: boolean){
        const chat = new ChatModel(uuid(), isDm, new Date())
        return chat
    }

    public static async formDb<K extends keyof Chat>(key: K, value: Chat[K]){
        const res = await db('chats').where({[key]: value}).select('*').first()
        if(!res){
            return undefined
        }
        const {id, isDm, created} = res
        return new ChatModel(id, isDm, created)
    }
}

export default ChatModel