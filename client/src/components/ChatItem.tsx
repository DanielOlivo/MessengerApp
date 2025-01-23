import { Message } from "../../../types/Types"

export  interface ChatItemProp {
    name: string
    lst: Message
}

export default function ChatItem (props: ChatItemProp) {
    const {name, lst} = props

    return (
        <div
            className="flex flex-row justify-start items-center border border-gray-200 rounded-md p-2" 
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
                <label>{lst.content}</label>
            </div>

        </div>
    )
}