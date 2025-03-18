import { ChatList } from "../ChatList/ChatList"
import { ChatView } from "../ChatView/ChatView"

export const ChatPage = () => {


    return (
        <div className="flex flex-row justify-between items-stretch">
            <ChatList />
            <ChatView />
        </div>
    )
}
