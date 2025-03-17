import { ChatId } from "../../../../shared/src/Types"
import { useApDispatch } from "../../app/hooks"
import { chatListIcons } from "../../assets/assets"
import { handleSelection } from "../slice"
import { UnseenCount } from "./UnseenCount"

export interface ChatItemProps {
    chatId: ChatId
    title: string
    content: string
    iconSrc: string
    unseenCount: number
    selected: boolean
    pinned: boolean
}

const { pin } = chatListIcons

export const ChatItem = ({chatId, title, content, iconSrc, unseenCount, selected = false, pinned}: ChatItemProps) => {

    const dispatch = useApDispatch()

    const handleClick = () => {
        console.log('doing something with ', chatId)
        dispatch(handleSelection(chatId))
    }
        
    return (
        <div className={`chat-item p-2 max-w-[400px] flex flex-row justify-between items-center border rounded-md border-black ${selected ? "bg-slate-200" : ""} hover:bg-slate-200`}
            onClick={handleClick}
        >

            <div className="w-8 h-8 overflow-hidden rounded-full">
                <img src={iconSrc} className="object-contain" />
            </div>

            <div className="ml-2 flex-grow max-w-[320px] flex flex-col justify-between">

                <div className="flex flex-row justify-start items-center">
                    <p className="font-bold text-slate-700">{title}</p>
                    {pinned && <img className="object-contain w-5 h-5" src={pin} />}
                </div>

                <p className="text-slate-400 truncate">{content}</p>
            </div>

            {unseenCount > 0 && <UnseenCount count={unseenCount} />}
        </div>
    )
}
