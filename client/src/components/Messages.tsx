import { ReactNode } from "react"
import { useAppSelector } from "../app/hooks"
import { MessageItem, selectMessages } from "../features/socket/selectors"
import { ChildrenProp } from "./ChildrenProp"
import DateMessage, { DateMessageProp } from "./DateMessage"
import DialogMessage, { DialogMessageProp } from "./DialogMessage"
import UserMessage, { UserMessageProp} from "./UserMessage"
import { ServiceMessage } from "../features/socket/socketSlice"
import { onlyMessages } from "../features/chatView/selectors"
import { selectGlobalState } from "../features/state/selectors"

const Messages = () => {

    // const messages = useAppSelector(selectMessages)
    const globalState = useAppSelector(selectGlobalState)
    const messages = useAppSelector(onlyMessages)

    return (
        <div
            className="overflow-y-auto
            px-3 flex-grow" 
            style={{visibility: globalState=='onChat' ? 'visible' : 'hidden'}}
        >
            {messages.map(({content, created, username, isOwner, unread}) => 
                <UserMessage content={content} username={username} created={created} isOwner={isOwner} unread={unread}/>
            )}
        </div>
    )
}

export default Messages

// function getMessage(arg: MessageItem): ReactNode {

//   if('date' in arg){
//     const {date}: DateMessageProp = arg
//     return <DateMessage date={date} />
//   }
//   else if('msg' in arg){
//     const {msg}: ServiceMessage = arg
//     return <DialogMessage message={msg} />
//   }
//   else {
//     const {isOwner, message, isRead, sender}: UserMessageProp = arg
//     return <UserMessage isOwner={isOwner} message={message} isRead={isRead} sender={sender}/>
//   }
// }