import { User } from '@models/models'
import { TokenPayload } from '@shared/Types'
import { io as ioc, type Socket as ClientSocket } from 'socket.io-client'
import jwt from 'jsonwebtoken'

const baseUrl = 'http://localhost:5000'

export class Client {

    static clients: Client[] = []

    static reset(){
        if(Client.clients){
            for(const client of Client.clients){
                if(client.socket){
                    client.socket.close()
                }
            }
            Client.clients = []
        }
    }

    _socket: ClientSocket
    token: string

    constructor(user: User){
        const authPayload: TokenPayload = {
            id: user.id,
            username: user.username
        }
        this.token = jwt.sign(authPayload, process.env.JWT_SECRET as string)
        this._socket = ioc(baseUrl, {auth: {token: this.token}})

        Client.clients.push(this)
    }


    public get socket(): ClientSocket {return this._socket}

}

export function waitFor(timeout: number, fn: (done: () => void) => Promise<void>, count: number = 1){
    let counter = 0
    return new Promise((res, rej) => {

        const _timeout = setTimeout(() => {
            rej(new Error('Timeout'))
        }, timeout)

        fn(() => {
            counter += 1
            if(counter === count){
                clearTimeout(_timeout)
                res(undefined)
            }
        })

    })
}