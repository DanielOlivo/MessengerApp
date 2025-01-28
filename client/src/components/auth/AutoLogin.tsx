import { useEffect } from "react"
import { Credentials } from "../../../../types/Client"
import { useApDispatch } from "../../app/hooks"
import { fetchToken } from "../../features/auth/authSlice"


const AutoLogin = (credentials: Credentials) => {

    const dispatch = useApDispatch()

    useEffect(() => {
        dispatch(fetchToken(credentials))
    },[])

    return <></>
}

export default AutoLogin