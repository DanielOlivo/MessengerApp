import {Request, Response, Router} from 'express'
import cors from 'cors'
import userController from '../controllers/users'
import { usernameValidator, passwordValidator, bioValidator } from '../middlewares/credentialValidator'

const router = Router()
// router.use(cors({
//     credentials: true,
//     origin: [
//         // 'http://localhost:3000', 
//         'http://localhost:5173',
//         process.env.BASE_URL as string,
//     ]
// }))

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

// router.get('/', (req: Request, res: Response) => {
//     res.sendStatus(200)
// })


export default router