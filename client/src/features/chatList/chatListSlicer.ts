import { createSlice, PayloadAction } from '@reduxjs/toolkit'
// import type { RootState } from '../../app/store'
// import { ChatItemProp } from '../../components/ChatItem'
import { ChatListItem, ChatMessage, ContactItem, SearchReq } from '@shared/Types'

interface ChatListState {
    list: ChatListItem[]
    searchResult: ContactItem[]
    state: 'list' | 'search'
}

const initialState: ChatListState = {
    list: [],
    state: 'list',
    searchResult: []
}

export const chatListSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {

        setState: (state, action: PayloadAction<'list' | 'search'>) => {
            state.state = action.payload
        },

        reqList: (state) => {},

        setList: (state, action: PayloadAction<ChatListItem[]>) => {
            state.list = action.payload
        },

        insertNewMessage: (state, action: PayloadAction<ChatMessage>) => {
            console.log('insert NEW FOR CHAT LIST')
            const msg = action.payload
            const idx = state.list.findIndex(item => item.chatId == msg.chatId)
            if(idx != -1){
                state.list.forEach(item => {
                    if(item.chatId == action.payload.chatId){
                        const {username, content} = action.payload
                        item.username = username
                        item.content = content
                    }
                })
            }
            else {
                const msg2: ChatListItem = {
                    chatId: msg.chatId,
                    username: msg.username,
                    content: msg.content,
                    chatName: '' // todo
                }
                state.list = [msg2, ...state.list]
            }
            
        },

        search: (state, action: PayloadAction<SearchReq>) => {},

        handleSearch: (state, action: PayloadAction<ContactItem[]>) => {
            state.searchResult = action.payload
        },

        clearResult: (state) => {
            state.searchResult = []
        }

    }
})

export const { setState, reqList, setList, insertNewMessage, search, handleSearch, clearResult } = chatListSlice.actions
export default chatListSlice.reducer

