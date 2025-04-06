import { ChatList } from "./components/ChatList/ChatList"
import { ChatView } from "./components/ChatView/ChatView"
import { Typing } from "./components/ChatView/components/Typing/Typing"

export const ChatPage = () => {


    return (
        <div className="flex flex-row justify-between items-stretch">
            <ChatList />
            <ChatView />
            <Typing />
        </div>
    )
}
