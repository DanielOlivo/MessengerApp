import { useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../../app/hooks"
import { selectAuthStatus } from "../../features/auth/selectors"

const Registration = () => {

    const usernameRef = useRef(null)
    const passwordRef = useRef(null)

    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(selectAuthStatus)

    useEffect(() => {
        if(isAuthenticated){
            navigate('/')
        }
    }, [])

    return (
        <div
            id='registration' 
        >
            <h2>Register</h2>
            <div
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
            <button>Submit</button>

        </div>
    )
}

export default Registration