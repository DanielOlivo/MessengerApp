import { useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useApDispatch, useAppSelector } from "@app/hooks"
import { selectAuthStatus, selectRegisterSuccess } from "@features/auth/selectors"
import { Credentials } from "@shared/Types"
import { register } from "@features/auth/thunks"

const Registration = () => {

    const usernameRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)

    const dispatch = useApDispatch()

    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(selectAuthStatus)
    const registerSuccess = useAppSelector(selectRegisterSuccess)

    useEffect(() => {
        if(isAuthenticated){
            navigate('/')
        }
    }, [])

    useEffect(() => {
        if(registerSuccess){
            navigate('/login')
        }
    }, [registerSuccess])

    const handleSubmit = () => {

        const username = usernameRef.current!.value 
        const password = passwordRef.current!.value

        if(username.length < 3 || password.length < 4){
            return
        }

        const credentials: Credentials = { username, password }
        dispatch(register(credentials))
    }

    return (
        <div
            className="w-screen h-screen flex flex-col justify-center items-center" 
        >
            <div
                id='registration' 
                className="flex flex-col justify-start items-start"
            >
                <h2
                    className="text-2xl" 
                >Register</h2>
                <div
                    className="mt-5"
                    id='username' 
                >
                    <input 
                        type='text'
                        placeholder="username" 
                        ref={usernameRef}
                    />
                </div>

                <div
                    id='password' 
                >
                    <input 
                        type='password' 
                        placeholder='password'
                        ref={passwordRef}
                    />
                </div>
                <button
                        className="border border-black rounded-md px-7 py-1 mt-3"
                        onClick={() => handleSubmit()} 
                >Submit</button>

                <div>
                    <button
                        className="text-gray-400"
                        onClick={() => navigate('/login')} 
                    >Login</button>
                </div>

            </div>

        </div>

    )
}

export default Registration