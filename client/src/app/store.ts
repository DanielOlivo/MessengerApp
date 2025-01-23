import {configureStore, applyMiddleware } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import socketReducer from '../features/socket/socketSlice'
import socketMiddleware from "../middlewares/socketMiddleware"

const store = configureStore({
    reducer: {
        auth: authReducer,
        socket: socketReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware().concat([socketMiddleware])
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export default store