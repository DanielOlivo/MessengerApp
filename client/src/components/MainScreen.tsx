import { useNavigate } from "react-router-dom"
import { ChildrenProp } from "./ChildrenProp"
import { useEffect } from "react"
import { useApDispatch, useAppSelector } from "../app/hooks"
import { selectAuthStatus, tokenExists } from "../Auth/selectors"
import { initSocket } from "../features/socket/socketSlice"


const MainScreen = ({children}: ChildrenProp) => {

    const navigate = useNavigate()
    const dispatch = useApDispatch()
    const isAuthenticated = useAppSelector(selectAuthStatus)
    const _tokenExists = useAppSelector(tokenExists) 

    useEffect(() => {
        if(!isAuthenticated){
            navigate('/login')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated])

    useEffect(() => {
        if(_tokenExists && !!_tokenExists){
            dispatch(initSocket())
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [_tokenExists])

    return (
        <div
            className="flex flex-row w-screen h-screen" 
        >
            {children}
        </div>
    )
}

export default MainScreen