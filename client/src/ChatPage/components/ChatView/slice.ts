import { ChatId } from "shared/src/Types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TextMessageProps } from "./components/TextMessage/TextMessage";
import { DateSeparatorProps } from "./components/DateSeparator/DateSeparator";
import { MessageStatusUpdate, Typing } from "@shared/Types";
import { DefaultTypings, Typings } from "./components/Typing/utils";
import { isTextMessage } from "./utils";

export type ContainerItem = TextMessageProps | DateSeparatorProps

export interface ChatViewState {
    items: { [P in ChatId]: ContainerItem[] }
    chatId: string,
    header: {
        iconSrc: string,
        title: string
    },
    typing: Typings
}

const initialState: ChatViewState = {
    items: {},
    chatId: '',
    header: {
        iconSrc: '',
        title: ''
    },
    typing: DefaultTypings
}

const slice = createSlice({
    name: 'chatView',
    initialState,
    reducers: {

        handleMessageStatusUpdate: (state, action: PayloadAction<MessageStatusUpdate>) => {
            const { id, chatId, status } = action.payload
            const msg = state.items[chatId].find(m => isTextMessage(m) && m.id === id) as TextMessageProps
            if(msg){
                msg.status = status
            }
        },

        handleTyping: (state, action: PayloadAction<Typing>) => {
            const { username, timestamp, chatId, userId } = action.payload
            const getNewUserTyping = (): Typing => ({username, userId, timestamp, chatId}) // to avoid repeating
            if(chatId in state.typing){
                const userTyping = state.typing[chatId].find(item => item.userId === userId)
                if(userTyping){
                    userTyping.timestamp = timestamp
                }
                else {
                    state.typing[chatId].push(getNewUserTyping())
                }
            }
            else {
                state.typing[chatId] = [ getNewUserTyping() ]
            }
        }
    }
})

export default slice.reducer
export const { handleTyping } = slice.actions