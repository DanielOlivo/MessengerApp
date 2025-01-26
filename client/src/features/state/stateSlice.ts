import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { ChatId } from '../../../../types/Types'

export type GlobalState = 'idle' | 'onSearch' | 'onChat'

export interface St {
    state: GlobalState
    activeChatId?: ChatId
}

const initialState: St = {
    state: 'idle' as GlobalState
}

export const stateSlice = createSlice({
    name: 'state',
    initialState,
    reducers: {

        setState: (state, action: PayloadAction<GlobalState>) => {
            state.state = action.payload

            if(action.payload != 'onChat'){
                state.activeChatId = undefined
            }
        },

        setActiveChat: (state, action: PayloadAction<ChatId>) => {
            state.activeChatId = action.payload
        }
         
    }
})

export const { setState, setActiveChat } = stateSlice.actions
export default stateSlice.reducer