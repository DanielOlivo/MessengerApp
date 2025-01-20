import express from 'express'
import cookieParser from 'cookie-parser'

import userRouter from './routes/users'

const app = express()
app.use(express.json())
app.use(cookieParser())

app.use('/api/user', userRouter)

export default app