import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatId } from '../../../../types/Types'
import { HeaderInfo } from '../../../../controllers/socket'

export type MemberCount = number
export type OnlineStatus = 'online' | 'offline'
export type Typing = boolean


export interface HeaderState {
    chatName: string
    isDm: boolean
    status: MemberCount | OnlineStatus | Typing
}

export interface HeaderSliceState {
    state?: HeaderState
    info?: HeaderInfo
    typing?: string[]
    onlineStatus?: string
}

const initialState: HeaderSliceState = {
    onlineStatus: 'online'
}

export const headerSlice = createSlice({
    name: 'header',
    initialState,
    reducers: {

        reqHeaderInfo: (state, action: PayloadAction<ChatId>) => {},

        setInfo: (state, action: PayloadAction<HeaderInfo>) =>{
            state.info = action.payload
        }

    }
})

export const { reqHeaderInfo, setInfo } = headerSlice.actions
export default headerSlice.reducer