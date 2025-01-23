import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

interface AuthState {
    authenticated: boolean
    token?: string
}

const initialState: AuthState = {
    authenticated: false
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {},
})

export default authSlice.reducer