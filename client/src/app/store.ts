import {configureStore, applyMiddleware } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import socketReducer from '../features/socket/socketSlice'
import chatListReducer from '../features/chatList/chatListSlicer'
import socketMiddleware from "../middlewares/socketMiddleware"


const store = configureStore({
    reducer: {
        auth: authReducer,
        chatList: chatListReducer,
        socket: socketReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware().concat([socketMiddleware])
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store