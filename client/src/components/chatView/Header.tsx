import { useApDispatch, useAppSelector } from "@app/hooks"
import LetterIcon from "../LetterIcon"
import { selectHeaderInfo, selectOnlineStatus, selectTyping, 
    selectTypingTrigger } from "@features/header/selectors"
import { timer } from "@features/header/headerSlice"

import { useEffect } from "react"
import { selectUserId } from "@features/auth/selectors"
import { logout } from "@features/auth/authSlice"

const Header = () => {

    const dispatch = useApDispatch()

    const info = useAppSelector(selectHeaderInfo)
    // const onlineStatus = useAppSelector(selectOnlineStatus)

    const typing = useAppSelector(selectTyping)
    const typingTrigger = useAppSelector(selectTypingTrigger)
    const userId = useAppSelector(selectUserId)

    const isOther = typing && userId != typing.userId
    
    useEffect(() => {
        // console.log(userId, typing?.userId)
        if(isOther){
            dispatch(timer())
        }
    }, [typingTrigger])

    const getStatus = () => {
        if(info === undefined){
            return <></>
        }
        if(isOther){
            return <label>{typing!.username} is typing...</label>
        }
        return <label>{info.count} members</label>
    }

    return (
        <div
            className="flex flex-row items-center justify-start
            w-full h-13 py-1
            border-b border-blue-300
            " 
        >
            <div
                className="w-8 h-8 ml-2" 
                style={{visibility: info ? 'visible' : 'hidden'}}
            >
                <LetterIcon letter={info?.chatName?.slice(0,1) || 'x'} front='white' back='blue'/>
            </div>
            <div
                className="flex flex-col items-start justify-between
                ml-3
                " 
                style={{visibility: info ? 'visible' : 'hidden'}}
            >
                <h1>{info?.chatName || ''}</h1>
                <label
                    className="text-sm text-gray-500" 
                >{getStatus()}</label>
            </div>
            <div className="flex-grow"></div>

            <div className="w-9 text-red-600">
                <button
                    onClick={(e) => dispatch(logout())} 
                >Log out</button>
            </div>
        </div>
    )
}

export default Header