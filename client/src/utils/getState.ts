import { RootState } from "../app/store";
import { ChatId, MessageId, UserId, UserInfo } from "../../../shared/src/Types";
import { getRandomSliceState } from "../ChatPage/utils";
import { ChatInfo } from "../ChatPage/slice";
// import { TextMessageProps } from "../ChatPage/components/ChatView/components/TextMessage/TextMessage";
import { Message } from "shared/src/Message";
import { getDefault } from "../Group/utils";
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

export function getState(state?: DeepPartial<RootState>): RootState {

    const chat = getRandomSliceState()
    const defaultGroup = getDefault()

    const st: RootState = {
        users: {
            users: state?.users?.users as {[P: UserId] : UserInfo} ?? getRandomUsers(),
            searchTerm: ''
        },
        chat: {
            chatMessageIds: state?.chat?.chatMessageIds as {[P in ChatId]: MessageId[]} ?? chat.chatMessageIds,
            chatInfo: state?.chat?.chatInfo as {[P in ChatId]: ChatInfo} ?? chat.chatInfo,
            messages: state?.chat?.messages as {[P in MessageId]: Message} ?? chat.messages,
            unseenCount: state?.chat?.unseenCount as {[P in ChatId]: number} ?? chat.unseenCount,
            pinned: state?.chat?.pinned ?? chat.pinned,
            displayedChatId: state?.chat?.displayedChatId ?? chat.displayedChatId,
            typing: state?.chat?.typing as {[P in ChatId]: {[U in UserId]: number}} ?? chat.typing,
            users: state?.chat?.users as {[P in UserId]: string} ?? chat.users
        },
        group: {
            state: state?.group?.state ?? defaultGroup.state,
            groupId: state?.group?.groupId ?? defaultGroup.groupId,
            isAdmin: state?.group?.isAdmin ?? defaultGroup.isAdmin,
            inGroup: state?.group?.inGroup ?? defaultGroup.inGroup,
            onSearch: state?.group?.onSearch ?? defaultGroup.onSearch,
            searchResult: state?.group?.searchResult ?? defaultGroup.searchResult
        },
        auth: {
            authenticated: true,
            data: {
                id: state?.auth?.data?.id ?? '',
                username: state?.auth?.data?.username ?? '',
                token: state?.auth?.data?.token ?? ''
            },
            registerSuccess: state?.auth?.registerSuccess ?? false
        },
        socket: {
            isConnected: false,
        },
        search: {
            onSearch: state?.search?.onSearch ?? false,
            result: state?.search?.result ?? [] 
        },
        context: {
            type: state?.context?.type ?? 'idle',
            id: state?.context?.id ?? '',
            position: state?.context?.position as Position ?? {x: 0, y: 0}
        }
    }

    return st
}

export function useRState(){
    const state = getEmpty()

    const makeUser = (): UserId => {
        state.auth.data = {
            id: uuid(),
            token: '',
            username: faker.internet.username()
        }
        return state.auth.data.id
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
            status: 'online'
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
        state, makeUser, getChatIds, addChat, getUserIds, getTying
    }
}

export function getEmpty(): RootState {
    return {
        users: {
            users: {},
            searchTerm: ''
        },
        chat: {
            chatMessageIds: {},
            chatInfo: {},
            messages: {},
            unseenCount: {},
            pinned:[],
            displayedChatId: '',
            typing: {},
            users: {} 
        },
        group: {
            state: 'idle',
            groupId: '',
            isAdmin: false,
            inGroup: [],
            onSearch: false,
            searchResult: []
        },
        auth: {
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
        status: 'online'
    }

    state.chat.chatMessageIds[chatId] = messages.map(msg => msg.messageId)
}

export type StateHook = ReturnType<typeof useRState>

// todo: replace getState
export function getRandomState(){
    const state = getEmpty()
    makeUser(state)
    makeChatWithUser(state)
    return state
}
