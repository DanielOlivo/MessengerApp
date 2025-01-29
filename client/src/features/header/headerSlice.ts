import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatId } from '../../types/Client'
import { HeaderInfo } from '../../types/Client'
import { ChatSelectRes, Typing } from '../../types/Client'
import createAppAsyncThunk from '../../app/createAppAsyncThunk'

export type MemberCount = number
export type OnlineStatus = 'online' | 'offline'


// export interface HeaderState {
//     chatName: string
//     isDm: boolean
//     status: MemberCount | OnlineStatus | Typing
// }

export const timer = createAppAsyncThunk('header.timer', async() => {
    console.log('start')
    await wait(1000)
    console.log('stop') 
    return
})

export interface HeaderSliceState {
    headerInfo?: HeaderInfo
    typing?: Typing
    typingTrigger: boolean
    onlineStatus?: string

}

const initialState: HeaderSliceState = {
    onlineStatus: 'online',
    typingTrigger: false
}

export const headerSlice = createSlice({
    name: 'header',
    initialState,
    reducers: {

        setHeaderInfo: (state, action: PayloadAction<ChatSelectRes>) =>{
            state.headerInfo = action.payload.headerInfo
        },

        resetHeader: (state) => {
            delete state.headerInfo
            delete state.typing
            delete state.onlineStatus
        },

        receiveTyping: (state, action: PayloadAction<Typing>) => {
            state.typing = action.payload
            state.typingTrigger = !state.typingTrigger
        },
    },
    extraReducers(builder) {
        builder
            .addCase(timer.pending, (state, action) => {

            })
            .addCase(timer.fulfilled, (state, action) => {
                if(state.typing){
                    delete state.typing
                }
            })
            .addCase(timer.rejected, (state, action) => {
                if(state.typing){
                    delete state.typing
                }
            })
    },
})

export const { setHeaderInfo, resetHeader, receiveTyping } = headerSlice.actions
export default headerSlice.reducer

function wait(ms: number){
    return new Promise(res => setTimeout(res, ms))
}