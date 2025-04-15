import {configureStore, ThunkAction, Action } from '@reduxjs/toolkit'
import authReducer from '../Auth/slice'
import socketReducer, { initSocket } from '@features/socket/socketSlice'
import socketMiddleware from "../middlewares/socketMiddleware"

import userReducer from '../users/slice'
import chatReducer from '../ChatPage/slice'
import groupReducer from '../ChatControl/slice'
import contextReducer from '../Context/slice'

const store = configureStore({
    reducer: {
        auth: authReducer,
        socket: socketReducer,

        users: userReducer,
        chat: chatReducer,
        group: groupReducer,
        context: contextReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware().concat([socketMiddleware])
    }
})

export type AppStore = typeof store

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action>

export default store

export function createStore(state: RootState, initialized: boolean = false){

    const st = configureStore({
        reducer: {
            auth: authReducer,
            group: groupReducer,
            socket: socketReducer,
            users: userReducer,
            chat: chatReducer,
            context: contextReducer
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