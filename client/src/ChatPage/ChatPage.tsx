import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../app/hooks"
import { selectAuthStatus } from "../Auth/selectors"
import { ChatList } from "./components/ChatList/ChatList"
import { ChatView } from "./components/ChatView/ChatView"
import { Typing } from "./components/ChatView/components/Typing/Typing"
import { useEffect } from "react"

export const ChatPage = () => {

    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(selectAuthStatus)

    useEffect(() => {
        if(!isAuthenticated){
            navigate('/login')
        }
    }, [])

    return (
        <div className="flex flex-row justify-between items-stretch">
            <ChatList />
            <ChatView />
            <Typing />
        </div>
    )
}
