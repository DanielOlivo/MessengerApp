import { useEffect } from "react"
import { Credentials } from "../../../../types/Client"
import { useApDispatch } from "../../app/hooks"
import { fetchToken, login } from "../../features/auth/authSlice"

export interface AutoLoginProp {
    credentials?: Credentials
}

const AutoLogin = ({credentials}: AutoLoginProp) => {

    const dispatch = useApDispatch()

    useEffect(() => {
        if(credentials){
            dispatch(fetchToken(credentials))
        }
        else {
            dispatch(login())
        }
    },[])

    return <></>
}

export default AutoLogin