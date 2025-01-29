import {configureStore, applyMiddleware, createAsyncThunk, ThunkAction, Action } from '@reduxjs/toolkit'
import authReducer from '../features/auth/authSlice'
import socketReducer from '../features/socket/socketSlice'
import chatListReducer from '../features/chatList/chatListSlicer'
import chatViewReducer from '../features/chatView/chatViewSlice'
import socketMiddleware from "../middlewares/socketMiddleware"
import headerReducer from '../features/header/headerSlice'
import stateReducer from '../features/state/stateSlice'
import groupReducer from '../features/group/groupSlice'


const store = configureStore({
    reducer: {
        auth: authReducer,
        chatList: chatListReducer,
        chatView: chatViewReducer,
        header: headerReducer,
        group: groupReducer,
        socket: socketReducer,
        state: stateReducer
    },
    middleware: getDefaultMiddleware => {
        return getDefaultMiddleware().concat([socketMiddleware])
    }
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
export type AppThunk = ThunkAction<void, RootState, unknown, Action>
// export const createAppAsyncThunk = createAsyncThunk.withTypes<{
//     state: RootState,
//     dispatch: AppDispatch
// }>()

export default store