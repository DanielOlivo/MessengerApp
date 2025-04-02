import { createAsyncThunk } from "@reduxjs/toolkit"
import { Credentials } from "shared/src/Types"

const url = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

export const register = createAsyncThunk('auth/register', async (credentials: Credentials) => {
    try {
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
    catch(error){
        return error
    }
})

export const fetchToken = createAsyncThunk('auth/fetchToken', async (credentials: Credentials) => {
    try {
        const payload = JSON.stringify(credentials)
        console.log(payload)
        const targetUrl = new URL('/api/user/login', url).href
        const res = await fetch(targetUrl, {
            method: 'POST',
            headers: {"Content-Type": "application/json"},
            body: payload
        })
        const json = await res.json()
        return json
        // return true
    }
    catch(error){
        return error
    }
})