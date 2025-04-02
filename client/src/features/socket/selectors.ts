import type { RootState } from "../../app/store"

export const selectConnectionStatus = (state: RootState) => 
    state.socket.isConnected