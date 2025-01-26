import { useAppSelector } from "../app/hooks"
import { selectChatName, selectGroupMemberCount, selectOthersOnlineStatusWhenDm } from "../features/socket/selectors"
import { ChildrenProp } from "./ChildrenProp"

import { isGroupSelected } from "../features/socket/selectors"
import LetterIcon from "./LetterIcon"
import { selectHeaderInfo, selectOnlineStatus, selectTyping } from "../features/header/selectors"

// export interface HeaderProp {
//     name: string
//     status: string
// }

// const Header = ({name, status}: HeaderProp) => {
const Header = () => {

    const info = useAppSelector(selectHeaderInfo)
    const typing = useAppSelector(selectTyping)
    const onlineStatus = useAppSelector(selectOnlineStatus)
    

    const getStatus = () => {
        if(info === undefined){
            return <></>
        }
        if(typing){
            return <label>{typing[0]} is typing...</label>
        }
        if(info.isDm){
            return <label>{onlineStatus}</label>
        }
        return <label>{info.count} members</label>
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
                style={{visibility: !!info ? 'visible' : 'hidden'}}
            >
                <LetterIcon letter={info?.chatName?.slice(0,1) || 'x'} front='white' back='blue'/>
            </div>
            <div
                className="flex flex-col items-start justify-between
                ml-3
                " 
            >
                <h1>{info?.chatName || ''}</h1>
                <label
                    className="text-sm text-gray-500" 
                >{getStatus()}</label>
            </div>
        </div>
    )
}

export default Header