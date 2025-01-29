import { createSlice } from '@reduxjs/toolkit'
// import { createAppAsyncThunk, type AppThunk, type RootState } from '../../app/store'
import { Credentials, UserAuthData } from '../../types/Client'
// import { RootState } from '../../app/store'
import createAppAsyncThunk from '../../app/createAppAsyncThunk'

interface AuthState {
    authenticated: boolean
    data?: UserAuthData
    registerSuccess?: boolean
}

const initialState: AuthState = {
    authenticated: false
}

const url = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'


export const register = createAppAsyncThunk('auth/register', async (credentials: Credentials) => {
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

export const fetchToken = createAppAsyncThunk('auth/fetchToken', async (credentials: Credentials) => {
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


export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        login: (state) => {
            const username = localStorage.getItem('username')
            const token = localStorage.getItem('token')
            const id = localStorage.getItem('userId')

            if([username, token, id].some(item => item == "undefined")){
                state.authenticated = false
                return
            }

            if(username && token && id){
                console.log('login')
                state.data = {
                    id: JSON.parse(id),
                    username: JSON.parse(username),
                    token: JSON.parse(token)
                }
                state.authenticated = true
            }
        },

        logout: (state) => {
            state.data = undefined
            state.authenticated = false

            localStorage.removeItem('username')
            localStorage.removeItem('token')
            localStorage.removeItem('userId')
        }
    },
    extraReducers: builder => {
        builder 
            .addCase(fetchToken.pending, (state, action) => {
                console.log('pending')
            })
            .addCase(fetchToken.rejected, (state, action) => {
                const msg = action.error.message
                console.log('error: ', msg)
            })
            .addCase(fetchToken.fulfilled, (state, action) => {
                console.log(action.payload)
                state.data = action.payload as UserAuthData 
                state.authenticated = true

                localStorage.setItem('username', JSON.stringify(state.data.username))
                localStorage.setItem('token', JSON.stringify(state.data.token))
                localStorage.setItem('userId', JSON.stringify(state.data.id))
            })

            .addCase(register.pending, (state, action) => {
                console.log('register: pending...')
            })
            .addCase(register.fulfilled, (state, action) => {
                const result = action.payload
                console.log('register: ', result)
                state.registerSuccess = true
            })
    }
})

export const {login, logout} = authSlice.actions
export default authSlice.reducer