import { ChatId } from "../../../../shared/src/Types"
import { useApDispatch } from "../../app/hooks"
import { handleSelection } from "../slice"

export interface ChatItemProps {
    chatId: ChatId
    title: string
    content: string
    iconSrc: string
    unseenCount: number
    selected: boolean
    pinned: boolean
}

export const ChatItem = ({chatId, title, content, iconSrc, unseenCount, selected = false}: ChatItemProps) => {

    const dispatch = useApDispatch()

    const handleClick = () => {
        console.log('doing something with ', chatId)
        dispatch(handleSelection(chatId))
    }

    return (
        <div className={`chat-item flex flex-row justify-between items-center border border-black ${selected ? "bg-slate-200" : ""}`}
            onClick={handleClick}
        >

            <div className="w-8 h-8">
                <img src={iconSrc} className="object-contain" />
            </div>

            <div className="flex-grow flex flex-col justify-between">
                <p>{title}</p>
                <p>{content}</p>
            </div>

            {unseenCount > 0 && (
                <div className="w-6 rounded-full bg-blue-500">
                    <label>{unseenCount}</label>
                </div>
            )}
        </div>
    )
}
