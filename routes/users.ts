import {Router} from 'express'
import userController from '../controllers/users'
import { usernameValidator, passwordValidator, bioValidator } from '../middlewares/credentialValidator'

const router = Router()

router.post(
    '/register', 
    [
        usernameValidator,
        passwordValidator,
        bioValidator,
    ],
    userController.register
)

router.post(
    '/login', 
    [
        usernameValidator, 
        passwordValidator,
    ],
    userController.login
)

export default router