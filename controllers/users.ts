import {hash, compare} from 'bcrypt'
import {Request, Response} from 'express'
import { validationResult } from 'express-validator'
import jwt from 'jsonwebtoken'

import { UserId, Credentials, RegCredentials, TokenPayload } from '../types/Types'
import userModel from '../models/users'

const controller = {

    register: async (req: Request, res: Response) => {

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            console.log('errors', errors)
            res.status(400).json('invalid credentials')
            return
        }

        const {username, password, bio}: RegCredentials = req.body

        const existing = await userModel.getByUsername(username)

        if(existing){
            res.status(401).json({message: 'user already exists'})
            return
        }

        const saltRounds = 10
        const hashed = await hash(password, saltRounds)  
        const {hashed: h, ...rest} = await userModel.create(username, hashed, bio)
        res.status(200).json(rest)
    },

    login: async(req: Request, res: Response) => {

        const errors = validationResult(req)
        if(!errors.isEmpty()){
            console.log('errors', errors)
            res.status(400).json('invalid credentials')
            return
        }

        const {username, password}: Credentials = req.body

        const dbUser = await userModel.getByUsername(username)
        if(!dbUser){
            res.status(404).json({message: 'username or password not match'})
            return
        }

        const passwordMatch = await compare(password, dbUser.hashed)
        if(!passwordMatch){
            res.status(404).json({message: 'username or password not match'})
            return
        }

        const authPayload: TokenPayload = {
            id: dbUser.id,
            username
        }

        const token = jwt.sign(authPayload, process.env.JWT_SECRET as string)

        res.status(200).json({id: dbUser.id, username, token})
    }
}

export default controller