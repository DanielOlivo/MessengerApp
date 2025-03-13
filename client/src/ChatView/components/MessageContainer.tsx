import { PropsWithChildren } from "react"

export interface MessageContainer {
    isOwn: boolean
    timestamp: string
}

export const MessageContainer = ({isOwn, timestamp, children}: PropsWithChildren<MessageContainer>) => {

    return (
        <div className={`w-full px-2 flex flex-row items-center ${isOwn ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-32 flex flex-col items-start">
                <div className="p-1 bg-white">
                    {children}
                </div>
                <p>{timestamp}</p>
            </div>
        </div>
    )
}
