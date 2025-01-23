import ChatItem, { ChatItemProp } from "./ChatItem"

export interface ChatListProp {
    chats: ChatItemProp[]
}

const ChatList = (props: ChatListProp) => {

    return (
        <div>
            {props.chats.map(chat => <ChatItem name={chat.name} lst={chat.lst} />)}
        </div>
    )

}