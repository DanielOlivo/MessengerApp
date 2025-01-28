import { useRef } from "react"
import { useApDispatch, useAppSelector } from "../../app/hooks"
import { send, sendTyping } from "../../features/sender/senderSlice"
import { selectChatId } from "../../features/chatView/selectors"
import { selectUserId, selectUsername } from "../../features/auth/selectors"

const SenfField = () => {

    const fieldRef = useRef<HTMLInputElement>(null)
    const dispatch = useApDispatch()
    const chatId = useAppSelector(selectChatId)
    const userId = useAppSelector(selectUserId)
    const username = useAppSelector(selectUsername)

    const handleSend = () => {
        const content = fieldRef.current!.value

        if(/^\s*$/.test(content)){ // check if empty
            return
        }

        dispatch( send({chatId: chatId!, content}) )
        fieldRef.current!.value = ''
    }

    return (
        <div
            className="flex-row justify-between
            w-full h-10 
            border-t border-blue-400
            
            " 
            style={{display: chatId ? 'flex' : 'none'}}
        >
            <input 
                className="flex-grow p-2"
                placeholder="type..." 
                ref={fieldRef}
                onKeyUp={(e) => {
                    if(e.key == 'Enter'){
                        handleSend()
                    }
                }}
                onChange={(e) => dispatch(sendTyping({
                    userId: userId!,
                    username: username!,
                    chatId: chatId!
                }))}
            />
            <button
                className="w-8" 
                onClick={(e) => handleSend()}
            >&#9654;</button>
        </div>
    )
}

export default SenfField