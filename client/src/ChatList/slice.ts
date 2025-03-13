import { PayloadAction } from "@reduxjs/toolkit";
import { ChatId } from "../../../shared/src/Types";
import { createSlice } from "@reduxjs/toolkit";
import { ChatItemProps } from "./components/ChatItem";

export interface ChatListState {
    items: ChatItemProps[]
}

const initialState: ChatListState = {
    items: []
}

const slice = createSlice({
    name: 'chatList',
    initialState,
    reducers: {
        handleSelection: (state, action: PayloadAction<ChatId>) => {
            console.log('SLICE HANDLE SELECTION')
            // state.items.forEach(item => {
            //     item.selected = item.chatId === action.payload
            // })
        }
    }
})

export default slice.reducer
export const { handleSelection } = slice.actions