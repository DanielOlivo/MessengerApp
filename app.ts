import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'

import userRouter from './routes/users'

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(cors({
    credentials: true,
    origin: ['http://localhost:5173']
}))

app.use('/api/user', userRouter)

export default app