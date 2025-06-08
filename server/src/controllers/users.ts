import db from '../config/db'
import { v4 as uuid } from 'uuid';
import {Request, Response} from 'express'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'
import { hash, compare } from 'bcryptjs'

import { Credentials, RegCredentials, TokenPayload } from '@shared/Types'
import userModel from '../models/users'
import { User } from '@models/models';
import dayjs from 'dayjs';

const controller = {

    register: async (req: Request, res: Response) => {

        try{
            const errors = validationResult(req)
            if(!errors.isEmpty()){
                // console.log('errors', errors)
                res.status(400).json('invalid credentials')
                return
            }

            const {username, password, bio}: RegCredentials = req.body

            const existing = await userModel.getByUsername(username)

            // console.log('existing', existing)
            if(existing.length > 0){
                res.status(401).json({message: 'user already exists'})
                return
            }

            const saltRounds = 10
            const hashed = await hash(password, saltRounds)  
            // create user instance
            const user: User = {
                id: uuid(),
                username,
                hash: hashed,
                created: dayjs().toDate(),
                iconSrc: ''
            }
            await userModel.create(user)
            res.sendStatus(200)
        }
        catch(error){
            if(error instanceof Error)
                console.log(error.message)
            res.sendStatus(500)
        }
    },

    login: async(req: Request, res: Response) => {
        try{

            const errors = validationResult(req)
            if(!errors.isEmpty()){
                console.log('errors', errors)
                res.status(400).json('invalid credentials')
                return
            }

            const {username, password}: Credentials = req.body

            // console.log('hey')
            const dbUsers = await userModel.getByUsername(username)
            // console.log('dbUsers', dbUsers)
            if(dbUsers.length === 0){
                // console.log('user not found')
                res.status(404).json({message: 'username or password not match'})
                return
            }
            const dbUser = dbUsers[0]

            // console.log('hey')

            const passwordMatch = await compare(password, dbUser.hash)
            if(!passwordMatch){
                // console.log('password not match')
                res.status(404).json({message: 'username or password not match'})
                return
            }

            // console.log('all good')

            const authPayload: TokenPayload = {
                id: dbUser.id,
                username
            }

            const token = jwt.sign(authPayload, process.env.JWT_SECRET as string)
            console.log('sending token: ', token)

            res.status(200).json({id: dbUser.id, username, token})
        }
        catch(err){
            if(err instanceof Error)
                console.log(err.message)
        }
    }
}

export default controller