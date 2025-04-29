import { useAppSelector } from "../../../../app/hooks"
import { Icon } from "../../../../common/Icon"
import { selectCurrentChatId, selectHeaderIcon, selectHeaderStatus, selectHeaderTitle } from '../../../selectors'
import { ChatInfoButton } from "./ChatInfoButton/ChatInfoButton"
import { chatListIcons } from "../../../../assets/assets"


export const Header = () => {

    const chatId = useAppSelector(selectCurrentChatId) 

    const name = useAppSelector(selectHeaderTitle)
    const iconSrc = useAppSelector(selectHeaderIcon)
    const status = useAppSelector(selectHeaderStatus)

    if(chatId === ''){
        return null
    }

    return (
        <div aria-label='header' className="flex flex-row justify-between items-center h-16 px-4 py-2 bg-sky-900 font-Montserrat text-sky-200">

            <div className="flex flex-row justify-start items-center">
                <Icon iconSrc={iconSrc === '' ? chatListIcons.userIcon : iconSrc} isOnline={false}/>                
                <div className="flex flex-col items-start justify-between ml-3">
                    <p>{name}</p>
                    <p>{status}</p>
                </div>

            </div>

            <ChatInfoButton />
        </div>
    )
}
