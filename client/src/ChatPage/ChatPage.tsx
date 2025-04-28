import { useNavigate } from "react-router-dom"
import { useAppSelector } from "../app/hooks"
import { selectAuthStatus } from "../Auth/selectors"
import { ChatList } from "./components/ChatList/ChatList"
import { ChatView } from "./components/ChatView/ChatView"
import { Typing } from "./components/ChatView/components/Typing/Typing"
import React, { useEffect } from "react"
import { selectState } from "../ChatControl/selectors"
import { Container } from "../ChatControl/components/Container"
import { Controls } from "../ChatControl/Controls"
import { createPortal } from "react-dom"

export const ChatPage = () => {

    const navigate = useNavigate()
    const isAuthenticated = useAppSelector(selectAuthStatus)
    const chatControlState = useAppSelector(selectState)

    useEffect(() => {
        if(!isAuthenticated){
            navigate('/login')
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuthenticated])

    return (
        <div className="flex flex-row justify-between items-stretch">
            <ChatList />
            <ChatView />
            <Typing />

            {chatControlState !== 'idle' && createPortal(
                <Container>
                    <Controls />
                </Container>
            , document.body)}
        </div>
    )
}
