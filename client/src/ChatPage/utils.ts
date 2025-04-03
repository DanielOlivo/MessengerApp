import { v4 as uuid } from "uuid";
import dayjs from "dayjs";
import { faker } from "@faker-js/faker";
import { ChatInfo, ChatSliceState } from "./slice";
import { getRandomHumanIcon } from "../assets/assets";
import { getTextMessages } from "../utils/textMessageGen";
import { isTextMessage } from "./components/ChatView/utils";
import { Message } from "shared/src/Message";
import { ChatId } from "shared/src/Types";

export function getEmptyState(): ChatSliceState {
    return {
        chatMessageIds: {},
        chatInfo: {},
        messages: {},
        unseenCount: {},
        pinned: [],
        displayedChatId: '',
        typing: {},
        users: {}
    }
}

export function addRandomChat(state: ChatSliceState, pinned: boolean = false, msgCount: number = 10): ChatId {
    const chatId = uuid()
    const info: ChatInfo = {
        name: faker.lorem.word(),
        status: faker.lorem.words(),
        iconSrc: ''
    }

    state.chatInfo[chatId] = info

    if(pinned){
        state.pinned.push(chatId)
    }
     
    const initTimestamp = dayjs().valueOf()
    state.chatMessageIds[chatId] = []

    for(let i = 0; i < msgCount; i++){
        const msg: Message = {
            messageId: uuid(),
            chatId,
            sender: uuid(),
            timestamp: initTimestamp + i * 1000 * 60 * 60,
            content: faker.lorem.sentence()
        }

        state.messages[msg.messageId] = msg
        state.chatMessageIds[chatId].unshift(msg.messageId)
    }

    return chatId
}


export function getRandomSliceState(): ChatSliceState{
    const state: ChatSliceState = {
        chatMessageIds: {},
        chatInfo: {},
        messages: {},
        unseenCount: {},
        pinned: [],
        displayedChatId: '',
        typing: {},
        users: {}
    }

    for(let i = 0; i < 20; i++){
        const chatId = uuid()
        const iconSrc = getRandomHumanIcon()
        const status = 'online'
        const msgs = getTextMessages(chatId, 10).filter(item => isTextMessage(item))
        

        state.chatMessageIds = {
            ...state.chatMessageIds,
            [chatId]: msgs.map(msg => msg.id)
        }

        state.chatInfo = {
            ...state.chatInfo,
            [chatId]: {
                name: faker.internet.username(),
                iconSrc,
                status
            }
        }

        state.messages = {
            ...state.messages,
            ...Object.fromEntries(msgs.map(msg => [msg.id, msg]))
        }
    }

    const chatIds = Object.keys(state.chatInfo)
    const idx = Math.floor(Math.random() * chatIds.length)
    state.displayedChatId = chatIds[idx]
    
    console.log('state', state)

    return state
}