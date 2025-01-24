import { ReactNode } from "react"
import ChatItem, { ChatItemProp } from "./ChatItem"

export interface ChatListProp {
    children?: ReactNode
}

const ChatList = ({children}: ChatListProp) => {

    return (
        <div
            className="flex flex-col justify-start w-1/3 h-screen overflow-y-auto" 
        >
            {children}
        </div>
    )
}

export default ChatList