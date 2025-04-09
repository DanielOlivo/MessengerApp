import { createAsyncThunk } from "@reduxjs/toolkit"
import { Credentials, UserAuthData } from "@shared/Types"

const url = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

// export interface LoginResponse {
//     token: string
//     userId: UserId
//     username: string
// }

export const register = createAsyncThunk(
    'auth/register', 
    async (credentials: Credentials) => {
        const payload = JSON.stringify(credentials)
        const targetUrl = new URL('/api/user/register', url).href
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: payload
        })
        const json = await res.json()
        return json
    }
)

export const fetchToken = createAsyncThunk(
    'auth/fetchToken', 
    async (credentials: Credentials) => {
        const payload = JSON.stringify(credentials)
        const targetUrl = new URL('/api/user/login', url).href
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: payload
        })
        const json = await res.json() as UserAuthData
        return json
    }
)