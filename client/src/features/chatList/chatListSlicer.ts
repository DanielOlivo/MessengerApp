import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'
// import { ChatItemProp } from '../../components/ChatItem'
import { ChatListItem } from '../../../../controllers/socket.ts'

interface ChatListState {
    list: ChatListItem[]
}

const initialState: ChatListState = {
    list: []
}

export const chatListSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {

        reqList: (state) => {},

        setList: (state, action: PayloadAction<ChatListItem[]>) => {
            state.list = action.payload
        }

    }
})

export const { reqList, setList } = chatListSlice.actions
export default chatListSlice.reducer

