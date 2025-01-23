import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface ChatState {

}

const initialState: ChatState = {

}

export const chatSlice = createSlice({
    name: 'chats',
    initialState,
    reducers: {}
})

