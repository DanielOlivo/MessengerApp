import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import {users, dms, messages} from './init'
import { DbUser, DM, Message } from "../../../../types/Types";

export interface SocketState {
    isConnected: boolean
    rooms: string[],
    msg: string,

    users: DbUser[]
    dms: DM[]
    messages: Message[]
}

const initialState: SocketState = {
    isConnected: false,
    
    rooms: [],
    msg: '',

    users, dms, messages
}

type RoomAction = PayloadAction<{room: string}>
type MsgAction = PayloadAction<string>

const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {
        initSocket: (state) => {
            console.log('initSocket: ', state)
            return
        },

        connectionEstablished: (state) => {
            state.isConnected = true;
            console.log('connected')
        },

        png: (state) => {
            console.log('PING')
        },

        connectionLost: (state) => {
            state.isConnected = false;
        },

        joinRoom: (state, action: RoomAction) => {
            let room = action.payload.room;
            state.rooms = state.rooms.concat(room)
            return
        },

        say: (state, action: MsgAction) => {
            // state.msg = action.payload.msg
        }
    }
})

export const { say, png, initSocket, connectionEstablished, connectionLost, joinRoom } = socketSlice.actions

export const selectStatus = (state: RootState) => state.socket.isConnected


export default socketSlice.reducer