import { ChatId } from "../../../shared/src/Types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TextMessageProps } from "./components/TextMessage";
import { DateSeparatorProps } from "./components/DateSeparator";
import { Typing } from "@shared/Types";

export type ContainerItem = TextMessageProps | DateSeparatorProps

// export interface Typing {
//     name: string
//     timestamp: number
// }

export interface ChatViewState {
    items: { [P in ChatId]: ContainerItem[] }
    chatId: string,
    header: {
        iconSrc: string,
        title: string
    },
    typing: Typing
}

const initialState: ChatViewState = {
    items: {},
    chatId: '',
    header: {
        iconSrc: '',
        title: ''
    },
    typing: {
        username: '',
        timestamp: 0,
        chatId: '',
        userId: ''
    }
}

const slice = createSlice({
    name: 'chatView',
    initialState,
    reducers: {
        handleTyping: (state, action: PayloadAction<Typing>) => {
            state.typing = action.payload
        }
    }
})

export default slice.reducer
export const { handleTyping } = slice.actions