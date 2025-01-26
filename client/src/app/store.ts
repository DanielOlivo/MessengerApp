import {configureStore, applyMiddleware } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import socketReducer from '../features/socket/socketSlice'
import chatListReducer from '../features/chatList/chatListSlicer'
import chatViewReducer from '../features/chatView/chatViewSlice'
import socketMiddleware from "../middlewares/socketMiddleware"
import headerReducer from '../features/header/headerSlice'
import stateReducer from '../features/state/stateSlice'


const store = configureStore({
    reducer: {
        auth: authReducer,
        chatList: chatListReducer,
        chatView: chatViewReducer,
        header: headerReducer,
        socket: socketReducer,
        state: stateReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware().concat([socketMiddleware])
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store