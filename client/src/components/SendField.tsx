import { useAppSelector } from "../app/hooks"
import { getSelectedChat } from "../features/socket/selectors"

const SenfField = () => {

    const selectedChat = useAppSelector(getSelectedChat)

    return (
        <div
            className="flex-row justify-between
            w-full h-10 
            border-t border-blue-400
            
            " 
            style={{display: !!selectedChat ? 'flex' : 'none'}}
        >
            <input 
                className="flex-grow p-2"
                placeholder="type..." 
            />
            <button
                className="w-8" 
            >&#9654;</button>
        </div>
    )
}

export default SenfField