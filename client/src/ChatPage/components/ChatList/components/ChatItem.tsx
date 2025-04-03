import { ChatId } from "shared/src/Types"
import { useApDispatch } from "../../../../app/hooks"
import { chatListIcons } from "../../../../assets/assets"
// import { handleSelection } from "../slice"
import { UnseenCount } from "./UnseenCount"
import { handleChatSelection } from "../../../slice"
import { ContextContainer } from "../../../../Context/ContextContainer"
import { ChatItemMenu } from "./ChatItemMenu"

export interface ChatItemProps {
    chatId: ChatId
    title: string
    content: string
    iconSrc: string
    unseenCount: number
    selected: boolean
    pinned: boolean
    timestamp: string
}

const { pin } = chatListIcons

const menuGetter = (chatId: ChatId, pinned: boolean) => () => <ChatItemMenu chatId={chatId} pinned={pinned} />

export const ChatItem = ({chatId, title, content, iconSrc, unseenCount, selected = false, pinned}: ChatItemProps) => {

    const dispatch = useApDispatch()

    const handleClick = () => {
        dispatch(handleChatSelection(chatId))
    }
        
    return (
        <ContextContainer type='chatItem' id={chatId} getMenu={menuGetter(chatId, pinned)}>
            <div className={`chat-item p-2 max-w-[400px] grid grid-cols-[40px_auto_40px] gap-2 border rounded-md border-slate-300 ${selected ? "bg-slate-200" : ""} hover:bg-slate-200`}
                onClick={handleClick}
            >

                <div className="overflow-hidden rounded-full">
                    <img src={iconSrc} className="object-contain" />
                </div>

                <div className="flex flex-col justify-between items-stretch overflow-hidden">

                    <div className="flex flex-row justify-start items-center">
                        <p className="font-bold text-slate-700 whitespace-nowrap truncate">{title}</p>
                        {pinned && <img className="object-contain w-5 h-5" src={pin} />}
                    </div>

                    <p className="text-slate-400 whitespace-nowrap truncate">{content}</p>
                </div>

                <div className="flex justify-center items-center">
                    {unseenCount > 0 && <UnseenCount count={unseenCount} />}
                </div>
            </div>
        </ContextContainer>
    )
}
