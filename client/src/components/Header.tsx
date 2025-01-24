import { useAppSelector } from "../app/hooks"
import { selectChatName } from "../features/socket/selectors"
import { ChildrenProp } from "./ChildrenProp"

export interface HeaderProp {
    name: string
    status: string
}

const Header = ({name, status}: HeaderProp) => {

    const chatName = useAppSelector(selectChatName)

    return (
        <div
            className="flex flex-row items-center justify-start
            w-full h-13 py-1
            border-b border-blue-300
            " 
        >
            <div
                className="w-8 h-8 bg-slate-500 rounded-full
                ml-2 
                " 
            ></div>
            <div
                className="flex flex-col items-start justify-between
                ml-3
                " 
            >
                <h1>{chatName}</h1>
                <label
                    className="text-sm text-gray-500" 
                >{status}</label>
            </div>
        </div>
    )
}

export default Header