import { RootState } from "../app/store";
import { ChatId, MessageId, UserId, UserInfo } from "../../../shared/src/Types";
import { getRandomSliceState } from "../ChatPage/utils";
import { ChatInfo } from "../ChatPage/slice";
import { Message } from "shared/src/Message";
import { getDefault } from "../ChatControl/utils";
import { getRandomUsers } from "../users/utils";
import { Position } from "../Context/slice";
import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import { Typing } from "../../../shared/src/Types";
import dayjs from "dayjs";

export type DeepPartial<T> = T extends Array<infer U>
    ? T 
    : T extends object 
    ? { [P in keyof T]?: DeepPartial<T[P]> }
    : T

export function getState(){
    const state = getEmpty()

    let initTimestamp = dayjs().subtract(2, 'days').valueOf()
    let interval = 10000

    const setInitTimestamp = (timestamp: number) => initTimestamp = timestamp
    const setInterval = (value: number) => interval = value

    const makeUser = (): UserId => {
        state.auth.data = {
            id: uuid(),
            token: '',
            username: faker.internet.username()
        }
        return state.auth.data.id
    }

    const addContact = (): UserId => {
        const user: UserInfo = {
            id: uuid(),
            name: faker.internet.username(),
            iconSrc: ''
        }
        state.users.users[user.id] = user
        return user.id
    }

    const addChat = (pinned: boolean = false, userId?: UserId ) => {
        const chatId = uuid()
        const otherId = userId ?? uuid()
        state.users.users[otherId] = {
            name: faker.internet.username(),
            id: otherId,
            iconSrc: ''
        }

        const messages: Message[] = Array.from({length: 10}, (_, idx) => ({
            messageId: uuid(),
            content: faker.lorem.sentence(),
            sender: idx % 2 === 0 ? otherId : state.auth.data.id,
            timestamp: initTimestamp + idx * interval,
            chatId
        }))

        state.chat.messages = {
            ...state.chat.messages,
            ...Object.fromEntries(messages.map(msg => [msg.messageId, msg]))
        }

        state.chat.chatInfo[chatId] = {
            name: state.users.users[otherId].name,
            iconSrc: state.users.users[otherId].iconSrc,
            status: 'online',
            isGroup: false
        }

        state.chat.members = {
            ...state.chat.members,
            [chatId]: [ otherId ]
        }

        if(pinned){
            state.chat.pinned.push(chatId)
        }

        state.chat.chatMessageIds[chatId] = messages.map(msg => msg.messageId)
        return { chatId, userId: otherId }
    }

    const getChatIds = () => Object.keys(state.chat.chatInfo)
    const getUserIds = () => Object.keys(state.users.users)

    const getTying = (chatId: ChatId): Typing => {
        const userId = getUserIds()[0]
        const userInfo = state.users.users[userId]
        return {
            chatId,
            userId,
            username: userInfo.name,
            timestamp: dayjs().valueOf()
        }
    }
        

    return { 
        state, makeUser, getChatIds, addChat, getUserIds, getTying, addContact,
        setInterval, setInitTimestamp
    }
}

export function getEmpty(): RootState {
    return {
        users: {
            users: {},
            online: [],
            searchTerm: '',
            onSearch: false,
            searchResult: []
        },
        chat: {
            chatMessageIds: {},
            chatInfo: {},
            messages: {},
            members: {},
            admins: {},
            unseenCount: {},
            pinned:[],
            displayedChatId: '',
            typing: {},
            users: {} 
        },
        group: {
            isGroup: true,
            state: 'idle',
            chatId: '',
            name: '',
            isAdmin: false,
            admins: [],
            inGroup: [],
            onSearch: false,
            searchResult: []
        },
        auth: {
            onWaiting: false,
            authenticated: false,
            data: {
                id: '',
                username: '',
                token: ''
            },
            registerSuccess: false
        },
        socket: {
            isConnected: false,
        },
        search: {
            onSearch: false,
            result: []
        },
        context: {
            type: 'idle',
            id: '',
            position: {x: 0, y: 0}
        }
    }
}

export function makeUser(state: RootState): void{
    state.auth.data = {
        id: uuid(),
        token: '',
        username: faker.internet.username()
    }
}

export function makeUsers(state: RootState, count: number = 4): void {
    state.users.users = Object.fromEntries(
        Array.from({length: count}, () => {
            const id = uuid()
            return [id, {
                id,
                name: faker.internet.username(),
                iconSrc: '' 
            }]
        }))
}

export function makeChatWithUser(state: RootState): void {
    const chatId = uuid()
    const otherId = uuid()
    state.users.users[otherId] = {
        name: faker.internet.username(),
        id: otherId,
        iconSrc: ''
    }

    const messages: Message[] = Array.from({length: 10}, (_, idx) => ({
        messageId: uuid(),
        content: faker.lorem.sentence(),
        sender: idx % 2 === 0 ? otherId : state.auth.data.id,
        timestamp: 0,
        chatId
    }))

    state.chat.messages = {
        ...state.chat.messages,
        ...Object.fromEntries(messages.map(msg => [msg.messageId, msg]))
    }

    state.chat.chatInfo[chatId] = {
        name: state.users.users[otherId].name,
        iconSrc: state.users.users[otherId].iconSrc,
        status: 'online',
        isGroup: false
    }

    state.chat.chatMessageIds[chatId] = messages.map(msg => msg.messageId)
}

export type StateHook = ReturnType<typeof getState>

// todo: replace getState
export function getRandomState(){
    const state = getEmpty()
    makeUser(state)
    makeChatWithUser(state)
    return state
}
