import { ChatMessage } from "@shared/Types"

export interface UserMessageProp {
    sender: string
    message: string
    isOwner: boolean
    isRead?: boolean
}

const UserMessage = ({messageId, content, username, created, isOwner, unread}: ChatMessage) => {

    const getReadStatus = () => {
        if(!unread){
            return <label style={{letterSpacing: "-9px"}}>&#x1F5F8;&#x1F5F8;</label>
        }
        return <label>&#x1F5F8;</label>
    }

    const flexDir = isOwner ? "flex-row-reverse" : "flex-row"

    return (
        <div
            id={messageId}
            className={`w-full flex ${flexDir} justify-between mt-1`}
        >
            <div
                className="border border-blue-100 rounded-lg p-1
                flex flex-col
                " 
            >
                <div>
                    {username}
                </div>
                <div
                    className="flex flex-row" 
                >
                    <div>{content}</div>
                    <div
                        // className="w-3" 
                        className="w-3 flex flex-col-reverse justify-start items-start ml-1" 
                    >
                        <label
                        >{getReadStatus()}</label>
                    </div>
                </div>
            </div>

            <div
                className="max-w-10 min-w-6" 
            ></div>
        </div>
    )
}

export default UserMessage