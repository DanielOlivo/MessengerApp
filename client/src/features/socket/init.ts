import { v4 as uuid } from "uuid";
import { DbUser, ChatId, DM, Message, MessageId, UserId, Membership, Group } from "../../../../types/Types";
import dateGen from "../../utils/getDateGen";

const getDate = dateGen()

export const users: {[id: UserId]: DbUser} = 
    Object.fromEntries(
        Array.from({length: 20}, (_, idx) => {
        return {
            id: uuid(),
            username: 'user' + idx,
            hashed: 'password',
            // created: new Date()
            created: getDate()
        }
        }).map(user => [user.id, user])
    )

const [user1Id, ...rest] = Object.keys(users)
const others = Object.fromEntries(rest.map(id => [id, users[id]]))

export const user1 = users[user1Id]

export const dms: {[id: ChatId]: DM} = 
    Object.fromEntries(
        Object.values(others).map(user => {
            return {
                id: uuid(),
                user1Id: user1.id,
                user2Id: user.id,
                // created: new Date()
                created: getDate()
            }
        }).map(dm => [dm.id, dm])
    )

const dudes: Group =  {
    id: uuid(),
    name: '==DUDES==',
    created: getDate()
}

export const groups = Object.fromEntries([dudes].map(gr => [gr.id, gr]))

export const memberships = 
    Object.fromEntries(
        [user1, ...rest.slice(0, 6).map(id => users[id])].map(user => {
            return {
                id: uuid(),
                groupId: dudes.id,
                userId: user.id,
                created: getDate(),
                isAdmin: true
            } as Membership
        }).map(member => [member.id, member])
    )

let counter = 1

const chats1 = Object.values(dms) as (DM | Group)[]
const chats2 = Object.values(groups) as (DM | Group)[]
export const chats = Object.fromEntries(chats1.concat(chats2).map(chat => [chat.id, chat]))

export const messages = 
    Object.fromEntries(
        Object.values(chats).map(chat => {
            const msgs: Message[] = Array.from({length: 20}, (_, idx) => {

                let userId: UserId

                if(Object.keys(chat).includes('user1Id')){
                    userId = idx % 2 == 0 ? (chat as DM).user1Id : (chat as DM).user2Id
                }
                else {
                    userId = user1.id
                }

                return {
                    id: uuid(),
                    userId: userId,
                    chatId: chat.id,
                    content: (counter++).toString(),
                    // created: new Date()
                    created: getDate()
                }
            })
            return msgs
        })
        .reduce((acc,v) => acc.concat(v), [])
        .map(msg => [msg.id, msg])
    )