import express, { Request, Response, Router } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'
import logger from "@logger/logger"

import userRouter from './routes/users'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173',
        process.env.BASE_URL as string
    ]
}))
logger.trace("express cors set")


app.use('/api/user', userRouter)

app.use(express.static(path.join(__dirname, '../client/dist')))
app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'))
})
export default app