import { ChatId } from "../../../shared/src/Types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TextMessageProps } from "./components/TextMessage";
import { DateSeparatorProps } from "./components/DateSeparator";
import { TypingInChat, Typing } from "@shared/Types";
import { DefaultTypings, Typings } from "./components/Typing/utils";

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
        handleTyping: (state, action: PayloadAction<TypingInChat>) => {
            const { username, timestamp, chatId, userId } = action.payload
            const getNewUserTyping = (): Typing => ({username, userId, timestamp}) // to avoid repeating
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