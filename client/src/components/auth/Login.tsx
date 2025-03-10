import { useEffect, useRef } from "react"
import { useApDispatch, useAppSelector } from "../../app/hooks"
import { selectAuthStatus } from "../../features/auth/selectors"
import { useNavigate } from "react-router-dom"
import { Credentials } from "../../types/Client"
import { fetchToken } from "../../features/auth/authSlice"

const Login = () => {

    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    const isAuthenticated = useAppSelector(selectAuthStatus)
    const navigate = useNavigate()

    useEffect(() => {
        if(isAuthenticated){
            navigate('/')
        }
    }, [])

    const dispatch = useApDispatch()

    const handleSubmit = () => {
        const credentials: Credentials = {
            username: usernameRef.current!.value,
            password: passwordRef.current!.value
        }
        console.log('credentials: ', credentials)
        dispatch(fetchToken(credentials))
    }


    return (
        <div
            className="w-screen h-screen flex flex-col justify-center items-center" 
        >

            <div
                id='login' 
                className="flex flex-col justify-start items-start"
            >
                <h2
                    className="text-2xl" 
                >Login</h2>
                <div 
                    className="mt-5"
                    id='username'>
                    
                    <input
                        type='text'
                        placeholder="username"
                        // defaultValue='john.doe'
                        ref={usernameRef}
                    />
                </div>

                <div
                    id='password'>
                    <input 
                        type='password'
                        placeholder="password"
                        // defaultValue='1234'
                        ref={passwordRef}
                    />
                </div>

                <div>
                    <button
                        className="border border-black rounded-md px-7 py-1 mt-3"
                        onClick={(e) => handleSubmit()} 
                    >Login</button>
                </div>

                <div>
                    <button
                        className="text-gray-400"
                        onClick={(e) => navigate('/register')} 
                    >Register</button>
                </div>
            </div>

        </div>
    )
}

export default Login