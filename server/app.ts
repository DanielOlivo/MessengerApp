import express, { Request, Response, Router } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import path from 'path'

import userRouter from './routes/users'

const app = express()
app.use(express.json())
app.use(cookieParser())

// app.use(cors({
//     credentials: true,
//     origin: [
//         // 'http://localhost:3000', 
//         'http://localhost:5173'
//     ]
// }))

app.use('/api/user', userRouter)

// export const port = process.env.PORT || 3000

// app.use(express.static(path.join(__dirname, '../client/dist', 'index.html')))
app.use(express.static(path.join(__dirname, '../client/dist')))
app.get('/', (req: Request, res: Response) => {
    res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'))
    // res.sendStatus(200)
})
// app.listen(3000, () => {})
export default app