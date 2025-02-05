import db from '@config/db'
import {v4 as uuid4} from 'uuid'
import { DbUser } from '@shared/Types'

type Status = 'none' | 'create' | 'update' | 'delete'

class UserModel implements DbUser {
    private _username: string
    private _hashed: string
    private _id: string
    private _created: Date

    private _status: Status

    private constructor(username: string, hashed: string, created: Date, id: string, status: Status){
        this._username = username
        this._hashed = hashed
        this._created = created
        this._id = id

        this._status = status
    }

    public get status() { return this._status; }

    public get id() { return this._id }
    public get created() { return this._created }

    public get username() { return this._username }      
    public set username(upd: string) {
        this._username = upd
        this.update()
    }

    public get hashed() { return this._hashed }
    public set hashed(upd: string) {
        this._hashed = upd
        this.update()
    }

    private update(){
        if(this._status == 'none'){
            this._status = 'update'
        }
    }

    public async push(trx: any){
        if(this._status == 'create'){
            this._status = 'none'
            await db('users').insert({
                id: this.id,
                username: this.username,
                hashed: this.hashed,
                created: this.created
            }).transacting(trx)
            return
        }
        this._status = 'none'
        await db('users').where({id: this.id}).update({
            hashed: this.hashed,
        }).transacting(trx)
    }

    public static async fromDb<K extends keyof DbUser>(key: K, value: DbUser[K]){
        const res = await db('users').where({[key]: value}).select('username', 'hashed', 'created', 'id').first()    
        if(!res){
            return undefined
        }
        const {id , username, hashed, created} = res
        return new UserModel(username, hashed, created, id, 'none')
    }
    
    public static create(username: string, hashed: string){
        const user = new UserModel(username, hashed, new Date(), uuid4(), 'create') 
        return user;
    }
}

export default UserModel