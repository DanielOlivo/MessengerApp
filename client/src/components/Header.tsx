import { useAppSelector } from "../app/hooks"
import { selectChatName, selectGroupMemberCount, selectOthersOnlineStatusWhenDm, selectTyping } from "../features/socket/selectors"
import { ChildrenProp } from "./ChildrenProp"

import { isGroupSelected } from "../features/socket/selectors"
import LetterIcon from "./LetterIcon"

// export interface HeaderProp {
//     name: string
//     status: string
// }

// const Header = ({name, status}: HeaderProp) => {
const Header = () => {

    const chatName = useAppSelector(selectChatName)
    const isGroup: boolean = useAppSelector(isGroupSelected)
    const memberAmount: number = useAppSelector(selectGroupMemberCount)
    const typing: string[] = useAppSelector(selectTyping)
    const isOnline = useAppSelector(selectOthersOnlineStatusWhenDm)

    const getStatus = () => {
        if(chatName === undefined){
            return ''
        }
        else if(typing.length == 1){
            return `${typing[0]} is typing...` 
        }
        else if(typing.length > 1){
            return typing.join(', ') + 'are typing...'
        }
        else if(isGroup){
            return `${memberAmount} members`
        }
        else {
            return isOnline ? 'online' : 'offline'
        }
    }

    return (
        <div
            className="flex flex-row items-center justify-start
            w-full h-13 py-1
            border-b border-blue-300
            " 
        >
            <div
                className="w-8 h-8 ml-2" 
                style={{visibility: !!chatName ? 'visible' : 'hidden'}}
            >
                <LetterIcon letter={chatName?.slice(0,1) || 'x'} front='white' back='blue'/>
            </div>
            <div
                className="flex flex-col items-start justify-between
                ml-3
                " 
            >
                <h1>{chatName || ''}</h1>
                <label
                    className="text-sm text-gray-500" 
                >{getStatus()}</label>
            </div>
        </div>
    )
}

export default Header