import { Socket, DefaultEventsMap, ExtendedError } from 'socket.io'
import jwt from 'jsonwebtoken'
import { TokenPayload } from '@shared/Types'
import userModel from '../models/users'

export const verifyToken = async (
    socket: Socket<DefaultEventsMap, DefaultEventsMap, DefaultEventsMap, any>, 
    next: (err?: ExtendedError) => void) => 
    {

        try {

            const token = socket.handshake.auth.token
            if(!token){
                throw new Error('token missing')
            }

            const payload = jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload

            // console.log('token payload', payload)
            
            const dbUser = await userModel.getById(payload.id)
            if(!dbUser){
                throw new Error('User not found')
            }

            socket.data = payload
            next()
        }
        catch(error){
            console.error("auth error", error)
            next(new Error("auth error"))
        }
    }