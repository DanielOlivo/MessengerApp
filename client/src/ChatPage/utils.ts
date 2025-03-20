import { v4 as uuid } from "uuid";
import { faker } from "@faker-js/faker";
import { ChatSliceState } from "./slice";
import { getRandomHumanIcon } from "../assets/assets";
import { getTextMessages } from "../utils/textMessageGen";
import { isTextMessage } from "./components/ChatView/utils";

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

    return state
}