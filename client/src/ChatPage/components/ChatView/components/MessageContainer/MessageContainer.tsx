import { PropsWithChildren } from "react"
import { MessageId } from "@shared/Types"
import { getIcon } from "./utils"
import { MessageStatus } from "@shared/Types"


export interface MessageContainerProps {
    id: MessageId
    isOwn: boolean
    timestamp: string
    status: MessageStatus
}

const notOwnStyle = 'bg-slate-600 text-slate-200'
const ownStyle = 'bg-pink-300 text-slate-800'

export const MessageContainer = ({isOwn, timestamp, status, children}: PropsWithChildren<MessageContainerProps>) => {

    return (
        <div aria-label='message-container' className={`w-full px-2 mt-2 flex flex-row items-center ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-4/5 flex flex-col items-start">
                <div className={`max-w-full rounded-md p-1 flex flex-row justify-between items-end ${isOwn ? ownStyle : notOwnStyle}`}>
                    <div className="flex-grow">
                        {children}
                    </div>
                    {isOwn && (
                        <img className="ml-2 w-4 h-4 object-contain" src={getIcon(status)}/>
                    )}
                </div>
                <p className="text-sky-200 text-xs">{timestamp}</p>
            </div>
        </div>
    )
}
