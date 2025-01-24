import { v4 as uuid } from "uuid";
import { DbUser, UserId, Message, Chat, ChatId, DM, Group } from "./types/Types";

const users: {[id: UserId]: DbUser} = 
    Object.fromEntries(
        Array.from({length: 10}, (_, idx) => {
        return {
            id: uuid(),
            username: 'user' + idx,
            hashed: 'password',
            created: new Date()
        }
        }).map(user => [user.id, user])
    )

const user1 = Object.values(users)[0]

const dms: {[id: ChatId]: DM} = 
    Object.fromEntries(
        Object.values(users).slice(1).map(user => {
            return {
                id: uuid(),
                user1Id: user1.id,
                user2Id: user.id,
                created: new Date()
            }
        }).map(dm => [dm.id, dm])
    )

let counter = 1

const msgs = 
    Object.fromEntries(
        Object.values(dms).map(dm => {
            const msgs: Message[] = Array.from({length: 20}, (_, idx) => {
                return {
                    id: uuid(),
                    userId: idx % 2 == 0 ? dm.user1Id : dm.user2Id,
                    chatId: dm.id,
                    content: (counter++).toString(),
                    created: new Date()
                }
            })
            return msgs
        })
        .reduce((acc,v) => acc.concat(v), [])
        .map(msg => [msg.id, msg])
    )



console.log(msgs)