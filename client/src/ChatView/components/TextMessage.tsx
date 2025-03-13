import { MessageContainer } from "./MessageContainer"

export interface TextMessageProps extends MessageContainer {
    chatId: string
    text: string
}

export const TextMessage = ({chatId, isOwn, timestamp, text}: TextMessageProps) => {
    return (
        <MessageContainer isOwn={isOwn} timestamp={timestamp}>
            <p>{text}</p>
        </MessageContainer>    
    )
}
