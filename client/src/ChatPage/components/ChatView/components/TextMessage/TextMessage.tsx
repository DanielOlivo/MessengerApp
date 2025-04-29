import { MessageContainer, MessageContainerProps } from "../MessageContainer/MessageContainer"

export interface TextMessageProps extends MessageContainerProps {
    chatId: string
    text: string
}

export const TextMessage = ({id, status, isOwn, timestamp, text}: TextMessageProps) => {

    return (
        <MessageContainer id={id} isOwn={isOwn} timestamp={timestamp} status={status}>
            <p className="font-Montserrat text-lg">{text}</p>
        </MessageContainer>    
    )
}
