import { ChatList } from "./components/ChatList/ChatList"
import { ChatView } from "./components/ChatView/ChatView"

export const ChatPage = () => {


    return (
        <div className="flex flex-row justify-between items-stretch">
            <ChatList />
            <ChatView />
        </div>
    )
}
