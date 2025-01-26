import { Message } from "../../../types/Types"
import { useApDispatch } from "../app/hooks"
import { selectChat } from "../features/socket/socketSlice"
import LetterIcon from "./LetterIcon"
import { ChatListItem } from "../../../controllers/socket"
import { reqMsgs } from "../features/chatView/chatViewSlice"

export  interface ChatItemProp {
    name: string
    content: string
    lastSenderName: string,
    chatId: string
}

export default function ChatItem ({chatName, username, content, chatId, unreadCount}: ChatListItem) {
    const dispatch = useApDispatch()

    const getUnreadCount  = () => {
        if(unreadCount == 0){
            return <></>
        } 

        return (
            <div className="flex flex-row justify-center items-center
            bg-blue-700 text-white rounded-full w-6 h-6">
                {unreadCount}
            </div>
        )
    }

    return (
        <div
            className="flex flex-row justify-start items-center border border-gray-200 p-2
            hover:bg-slate-200 active:bg-slate-500 
            " 
            onClick={(e) => {
                // console.log('chat selected: ' + chatId)
                // dispatch(selectChat(chatId))
                dispatch(reqMsgs(chatId))
            }}
        >
            <div
                className="for-icon w-9 h-9 flex flex-col justify-center items-center" 
            >
                {/* <div className="bg-slate-700 rounded-full w-8 h-8" /> */}
                <LetterIcon front='white' back='blue' letter={chatName.slice(0,1)} />
            </div>

            <div
                className="flex flex-col items-start justify-between ml-4 flex-grow" 
            >
                <label>{chatName}</label>
                <div
                    className="flex flex-row justify-between w-full" 
                >
                    <div className="text-blue-800">{username}: </div>
                    <div className="text-gray-700 flex-grow">{content}</div>
                    <div>{getUnreadCount()}</div>
                </div>

            </div>

        </div>
    )
}