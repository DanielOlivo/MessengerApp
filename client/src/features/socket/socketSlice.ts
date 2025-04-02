import { createSlice } from "@reduxjs/toolkit";

export interface SocketState {
    isConnected: boolean
}

const initialState: SocketState = {
    isConnected: false,
}


const socketSlice = createSlice({
    name: "socket",
    initialState,
    reducers: {

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        initSocket: (state) => {
            console.log('initSocket: ')//, state)
            return
        },

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        disconnect: (state) => {
            console.log('disconnecting')
        },

        connectionEstablished: (state) => {
            state.isConnected = true;
            console.log('connected')
        },


        connectionLost: (state) => {
            state.isConnected = false;
        },


    }
})

export const { disconnect, initSocket, connectionEstablished, connectionLost } = socketSlice.actions
export default socketSlice.reducer