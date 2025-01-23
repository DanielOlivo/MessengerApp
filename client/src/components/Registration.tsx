import { useRef } from "react"

const Registration = () => {

    const usernameRef = useRef(null)
    const passwordRef = useRef(null)

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