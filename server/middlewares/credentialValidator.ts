import { Request, Response } from 'express'
import { body } from 'express-validator'

export const usernameValidator = 
    body('username').isString().isLength({min: 3, max: 60}).trim()

export const passwordValidator = 
    body('password').isString().isLength({min: 4, max: 256}).trim()

export const bioValidator = 
    body('bio').optional().isString()
