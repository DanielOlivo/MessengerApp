import { useEffect } from "react"
import { Credentials } from "@shared/Types"
import { useApDispatch } from "@app/hooks"
import { fetchToken } from "@src/Auth/thunks"

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    return <></>
}

export default AutoLogin