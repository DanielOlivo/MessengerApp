import { useEffect } from "react"
import { Credentials } from "@shared/Types"
import { useApDispatch } from "@app/hooks"
import { fetchToken, login } from "@features/auth/thunks"

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