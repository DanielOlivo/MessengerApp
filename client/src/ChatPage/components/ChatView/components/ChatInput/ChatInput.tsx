import { useApDispatch, useAppSelector } from "@app/hooks"
import { useRef } from "react"
import { selectCurrentChatId } from "../../../../selectors"
import { MessagePostReq } from "shared/src/Types"
import { sendMessage } from "../../../../slice"

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
            dispatch(sendMessage(req))
        }
    }

    return (
        <div aria-label='chat-input' className="w-full flex flex-row justify-between border-t-2 border-slate-300 p-2">
            <input aria-label="chat-input-field" type='text' placeholder="type here..." className="flex-grow" ref={inputRef} onKeyUp={(e) => {
                if(e.key === 'Enter'){
                    handleSend()
                }
            }}/>
            <button aria-label='chat-input-send' className="ml-2" onClick={handleSend}>Send</button>
        </div>
    )
}
