import { ReactNode } from "react"
import { useAppSelector } from "../app/hooks"
import { MessageItem, selectMessages } from "../features/socket/selectors"
import { ChildrenProp } from "./ChildrenProp"
import DateMessage, { DateMessageProp } from "./DateMessage"
import DialogMessage, { DialogMessageProp } from "./DialogMessage"
import UserMessage, { UserMessageProp} from "./UserMessage"
import { ServiceMessage } from "../features/socket/socketSlice"

const Messages = () => {

    const messages = useAppSelector(selectMessages)

    return (
        <div
            className="overflow-y-auto
            px-3 flex-grow" 
        >
            {messages.map(getMessage)}
        </div>
    )
}

export default Messages

function getMessage(arg: MessageItem): ReactNode {

  if('date' in arg){
    const {date}: DateMessageProp = arg
    return <DateMessage date={date} />
  }
  else if('msg' in arg){
    const {msg}: ServiceMessage = arg
    return <DialogMessage message={msg} />
  }
  else {
    const {isOwner, message, isRead, sender}: UserMessageProp = arg
    return <UserMessage isOwner={isOwner} message={message} isRead={isRead} sender={sender}/>
  }
}