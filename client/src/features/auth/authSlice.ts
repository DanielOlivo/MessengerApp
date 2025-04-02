import { createSlice } from '@reduxjs/toolkit'
import { UserAuthData } from "@shared/Types"
import { register, fetchToken } from './thunks'

interface AuthState {
    authenticated: boolean
    data?: UserAuthData
    registerSuccess?: boolean
}

const initialState: AuthState = {
    authenticated: false
}

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
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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