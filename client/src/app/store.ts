import {configureStore, applyMiddleware, createAsyncThunk, ThunkAction, Action } from '@reduxjs/toolkit'
import authReducer from '@features/auth/authSlice'
import socketReducer, { initSocket } from '@features/socket/socketSlice'
import chatListReducer from '@features/chatList/chatListSlicer'
import chatViewReducer from '@features/chatView/chatViewSlice'
import socketMiddleware from "../middlewares/socketMiddleware"
import headerReducer from '@features/header/headerSlice'
import stateReducer from '@features/state/stateSlice'
// import groupReducer from '@features/group/groupSlice'

import chatListReducer2 from '../ChatPage/components/ChatList/slice'
import chatViewReducer2 from '../ChatPage/components/ChatView/slice'

import chatReducer from '../ChatPage/slice'
import groupReducer from '../Group/slice'
import searchReducer from '../Search/slice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        chatList: chatListReducer,
        chatView: chatViewReducer,
        header: headerReducer,
        // group: groupReducer,
        socket: socketReducer,
        state: stateReducer,
        
        chatList2: chatListReducer2,
        chatView2: chatViewReducer2,

        chat: chatReducer,
        group: groupReducer,
        search: searchReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware().concat([socketMiddleware])
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action>

export default store

export function createStore(state: RootState, initialized: boolean = false){

    const st = configureStore({
        reducer: {
            auth: authReducer,
            chatList: chatListReducer,
            chatView: chatViewReducer,
            header: headerReducer,
            group: groupReducer,
            socket: socketReducer,
            state: stateReducer,
            
            chatList2: chatListReducer2,
            chatView2: chatViewReducer2,
            chat: chatReducer,
            search: searchReducer
        },
        preloadedState: state,
        middleware: getDefaultMiddleware => {
            return getDefaultMiddleware().concat([socketMiddleware])
        },
        
    })
    
    if(initialized){
        st.dispatch(initSocket())
    }

    return st
}