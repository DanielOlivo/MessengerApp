import { Chat, DbUser, DM, Message } from '../../../../types/Types'

const user1: DbUser = {id: '1', username: 'user1', hashed: "", created: new Date()}
const user2: DbUser = {id: '2', username: 'user2', hashed: "", created: new Date()}
const user3: DbUser = {id: '3', username: 'user3', hashed: "", created: new Date()}


export const users = [user1, user2, user3]

const dm12Chat: Chat = {id: '1', isDm: true}
const dm13Chat: Chat = {id: '2', isDm: true}

const dm12: DM = {id: dm12Chat.id, user1Id: user1.id, user2Id: user2.id, created: new Date()}
const dm13: DM = {id: dm12Chat.id, user1Id: user1.id, user2Id: user2.id, created: new Date()}

export const dms = [dm12, dm13]

 const dm12Messages: Message[] = 
    Array.from({length: 10}, (_, i) => {
        return {
            id: (i * 1).toString(),
            userId: i % 2 == 0 ? user1.id : user2.id,
            chatId: dm12.id,
            created: new Date(new Date().getMilliseconds() - 1000 * 60 * (60 - i)),
            content: i.toString()
        }
    })

const dm13Messages: Message[] = 
    Array.from({length: 10}, (_, i) => {
        return {
            id: (20 + i * 1).toString(),
            userId: i % 2 == 0 ? user1.id : user2.id,
            chatId: dm12.id,
            created: new Date(new Date().getMilliseconds() - 1000 * 60 * (60 - 2 * i)),
            content: (20 + i).toString()
        }
    })

export const messages = dm12Messages.concat(dm13Messages)

// const users: DbUser[] = [
//     {
//         id: "1",
//         username: "user1",
//         password: "password"
//     },
//     {
//         id: "2",
//         username: "user2",
//         password: "password"
//     },
//     {
//         id: "3",
//         username: "user3",
//         password: "password"
//     },
// ]

// const dms: DM[] = [
//     {
//         hey: 'dude'
//     }
// ]

