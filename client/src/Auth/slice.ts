import { createSlice } from '@reduxjs/toolkit'
import { UserAuthData } from "@shared/Types"
import { register, fetchToken } from './thunks'

interface AuthState {
    onWaiting: boolean
    authenticated: boolean
    data: UserAuthData
    registerSuccess: boolean
}

const initialState: AuthState = {
    onWaiting: false,
    authenticated: false,
    data: {
        id: '',
        username: '',
        token: ''
    },
    registerSuccess: false
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {

        autologin: (state) => {
            const username = localStorage.getItem('username')
            const token = localStorage.getItem('token')
            const id = localStorage.getItem('userId')

            if([username, token, id].some(item => item == "undefined")){
                state.authenticated = false
                return
            }

            if(username && token && id){
                // console.log('login')
                state.data = {
                    id: JSON.parse(id),
                    username: JSON.parse(username),
                    token: JSON.parse(token)
                }
                state.authenticated = true
                localStorage.setItem('username', username) 
                localStorage.setItem('token', token)
                localStorage.setItem('userId', id)
            }
        },

        logout: (state) => {
            state.data = {
                id: '',
                username: '',
                token: ''
            }
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
                state.onWaiting = true
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .addCase(fetchToken.rejected, (state, action) => {
                state.onWaiting = false
            })
            .addCase(fetchToken.fulfilled, (state, action) => {
                state.onWaiting = false
                state.data = action.payload as UserAuthData 
                state.authenticated = true

                localStorage.setItem('username', JSON.stringify(state.data.username))
                localStorage.setItem('token', JSON.stringify(state.data.token))
                localStorage.setItem('userId', JSON.stringify(state.data.id))
            })

            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .addCase(register.pending, (state, action) => {
                // console.log('register: pending...')
            })
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            .addCase(register.fulfilled, (state, action) => {
                // const result = action.payload
                // console.log('register: ', result)
                state.registerSuccess = true
            })
    }
})

export const {autologin, logout} = authSlice.actions
export default authSlice.reducer