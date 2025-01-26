import { ReactNode, useEffect } from "react"
import ChatItem, { ChatItemProp } from "./ChatItem"
import SearchField from "./SearchField"
import { useApDispatch, useAppSelector } from "../app/hooks"
import { selectChatList } from "../features/chatList/selectors"
import { reqList } from "../features/chatList/chatListSlicer"
import { useSelector } from "react-redux"
import { selectConnectionStatus } from "../features/socket/selectors"

export interface ChatListProp {
    children?: ReactNode
}

const ChatList = () => {

    const dispatch = useApDispatch()
    const isConnected = useSelector(selectConnectionStatus)
    const chatList = useAppSelector(selectChatList)

    useEffect(() => {
        setTimeout(() => dispatch(reqList()), 1000)
    },[isConnected])

    return (
        <div
            className="flex flex-col justify-start w-1/3 h-screen overflow-y-auto
            border-r border-blue-300 
            " 
        >
            <SearchField />
            {chatList.map(({username, content, chatName, chatId, unreadCount}) => 
                <ChatItem chatName={chatName} content={content} username={username} chatId={chatId} unreadCount={unreadCount}/>)}
        </div>
    )
}

export default ChatList