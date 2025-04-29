import { useApDispatch, useAppSelector } from "@app/hooks"
import { useRef } from "react"
import { selectCurrentChatId } from "../../../../selectors"
import { MessagePostReq } from "shared/src/Types"
import { sendMessage, sendTyping } from "../../../../slice"

export const ChatInput = () => {

    const inputRef = useRef<HTMLInputElement>(null)
    const chatId = useAppSelector(selectCurrentChatId)
    const dispatch = useApDispatch()

    if(chatId === ''){
        return null
    }

    const handleSend = () => {
        if(inputRef.current){
            const content = inputRef.current.value
            if(content.length === 0){
                return
            }
            const req: MessagePostReq = { chatId, content }
            inputRef.current.value = ''
            dispatch(sendMessage(req))
        }
    }

    return (
        <div aria-label='chat-input' className="w-full h-9 flex flex-row justify-between border-t-2 border-slate-300 p-2 bg-sky-900 font-Montserrat">
            <input 
                aria-label="chat-input-field" 
                type='text' 
                placeholder="type here..." 
                className="flex-grow border-b-2 border-sky-200 border-opacity-20 bg-[rgba(0,0,0,0)] text-sky-200 placeholder:text-sky-400 focus:outline-none" 
                ref={inputRef} 
                onChange={() => dispatch(sendTyping(chatId))}  
                onKeyUp={(e) => {
                    if(e.key === 'Enter'){
                        handleSend()
                    }
                }}/>
            <button 
                aria-label='chat-input-send' 
                className="ml-2 font-bold text-sky-200" 
                onClick={handleSend}
            >Send</button>
        </div>
    )
}
