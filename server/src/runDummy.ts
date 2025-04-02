import express from 'express'
import { createServer } from 'http'
import cors from 'cors'
import { faker } from '@faker-js/faker'
import { v4 as uuid } from 'uuid'

import { Server } from 'socket.io'
import { UserInfo } from 'shared/src/Types'
import { getRandomUserInfoCollection } from 'shared/src/UserInfo'
import { getRandomChatInfoCollection } from 'shared/src/ChatInfo'
import { getMessageCollection } from 'shared/src/Message'
import { wait } from '@shared/utils'
import dayjs from 'dayjs'

const app = express()
app.use(cors({
    credentials: true,
    origin: [
        'http://localhost:3000', 
        'http://localhost:5173',
        process.env.BASE_URL as string
    ]
}))


const httpServer = createServer(app)

const io = new Server(httpServer, {
    cors: {
        origin: ["http://localhost:5173"],
        methods: ["GET", "POST"],
        credentials: true
    }
})

const { users, chats, all, chatMessages } = getData()
const user: UserInfo = Object.entries(users)[0][1]


io.on('connection', socket => {
    console.log('hi')

    socket.on('number', n => {
        console.log("number", n)
    })

    setInterval(() => {
        socket.emit('trs', {
            username: user.name,
            userId: user.id,
            timestamp: dayjs().valueOf()
        })
        console.log('emitting')
    },2000)

})

httpServer.listen(3000,() => {
    console.log('http://localhost:3000')
})

function getData() {
    const users = getRandomUserInfoCollection()
    const chats = getRandomChatInfoCollection()
    const msgs = getMessageCollection(Object.keys(chats), Object.keys(users))

    return {
        ...msgs, users, chats
    }
}


