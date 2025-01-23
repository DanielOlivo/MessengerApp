import { useRef } from "react"

const Login = () => {

    const usernameRef = useRef(null)
    const passwordRef = useRef(null)

    return (
        <div
            id='login' 
        >
            <h2>Login</h2>
            <div 
                id='username'>
                <input
                    type='text'
                    placeholder="username"
                    ref={usernameRef}
                />
            </div>

            <div
                id='password'>
                <input 
                    type='password'
                    placeholder="password"
                    ref={passwordRef}
                />
            </div>

            <div>
                <button>Login</button>
            </div>
        </div>
    )
}

export default Login