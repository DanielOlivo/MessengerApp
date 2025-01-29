// 1 dm, 1 group

import { v4 as uuid } from 'uuid'
import dateGen from '../../utils/getDateGen'
import { DbUser, DM, Group, Membership, Message } from '../../types/Client'

const getDate = dateGen()

export const user1: DbUser = {
    id: uuid(),
    username: 'user1',
    hashed: 'password',
    created: getDate()
}

const user2: DbUser = {
    id: uuid(),
    username: 'user2',
    hashed: 'password',
    created: getDate()
}

const user3: DbUser = {
    id: uuid(),
    username: 'user3',
    hashed: 'password',
    created: getDate()
}

export const users = {
    [user1.id]: user1,
    [user2.id]: user2,
    [user3.id]: user3
}


const dm12: DM = {
    id: uuid(),
    user1Id: user1.id,
    user2Id: user2.id,
    created: getDate()
}

export const dms = {
    [dm12.id]: dm12
}

const group1: Group = {
    id: uuid(),
    name: 'dudes',
    created: getDate()
}

export const groups = {
    [group1.id]: group1
}

const membership1: Membership = {
    id: uuid(),
    userId: user1.id,
    groupId: group1.id,
    created: getDate(),
    isAdmin: true
}

const membership2: Membership = {
    id: uuid(),
    userId: user2.id,
    groupId: group1.id,
    created: getDate(),
    isAdmin: true
}

const membership3: Membership = {
    id: uuid(),
    userId: user3.id,
    groupId: group1.id,
    created: getDate(),
    isAdmin: true
}

export const memberships = {
    [membership1.id]: membership1,
    [membership2.id]: membership2,
    [membership3.id]: membership3,
}

const dmMsg1: Message = {
    id: uuid(),
    userId: user1.id,
    chatId: dm12.id,
    content: 'hey',
    created: getDate()
}

const dmMsg2: Message = {
    id: uuid(),
    userId: user2.id,
    chatId: dm12.id,
    content: 'DUDE',
    created: getDate()
}


const groupMsg1: Message = {
    id: uuid(),
    userId: user1.id,
    chatId: group1.id,
    content: 'one',
    created: getDate()
}

const groupMsg2: Message = {
    id: uuid(),
    userId: user2.id,
    chatId: group1.id,
    content: 'two',
    created: getDate()
}

const groupMsg3: Message = {
    id: uuid(),
    userId: user3.id,
    chatId: group1.id,
    content: 'three',
    created: getDate()
}

export const messages = 
    Object.fromEntries(
        [dmMsg1, dmMsg2, groupMsg1, groupMsg2, groupMsg3].map(msg => 
            [msg.id, msg]
        )
    )