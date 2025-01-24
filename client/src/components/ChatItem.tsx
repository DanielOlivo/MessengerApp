import { Message } from "../../../types/Types"
import { useApDispatch } from "../app/hooks"
import { selectChat } from "../features/socket/socketSlice"

export  interface ChatItemProp {
    name: string
    content: string
    lastSenderName: string,
    chatId: string
}

export default function ChatItem (props: ChatItemProp) {
    const {name, content, lastSenderName, chatId} = props
    const dispatch = useApDispatch()

    return (
        <div
            className="flex flex-row justify-start items-center border border-gray-200 p-2
            hover:bg-slate-200 active:bg-slate-500 
            " 
            onClick={(e) => {
                // console.log('chat selected: ' + chatId)
                dispatch(selectChat(chatId))
            }}
        >
            <div
                className="for-icon w-9 h-9 flex flex-col justify-center items-center" 
            >
                <div className="bg-slate-700 rounded-full w-8 h-8">
                </div>
            </div>

            <div
                className="flex flex-col items-start justify-between ml-4" 
            >
                <label>{name}</label>
                <label><span className="text-blue-800">{lastSenderName}</span>: <span className="text-gray-700">{content}</span></label>
            </div>

        </div>
    )
}