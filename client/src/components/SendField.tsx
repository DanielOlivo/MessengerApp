import { useEffect, useRef } from "react"
import { useApDispatch, useAppSelector } from "../app/hooks"
import { getSelectedChat } from "../features/socket/selectors"
import { selectActiveChat, selectGlobalState } from "../features/state/selectors"
import { send } from "../features/sender/senderSlice"

const SenfField = () => {

    // const selectedChat = useAppSelector(getSelectedChat)
    const fieldRef = useRef<HTMLInputElement>(null)

    const dispatch = useApDispatch()
    const globalState = useAppSelector(selectGlobalState)
    const activeChat = useAppSelector(selectActiveChat)

    // useEffect(() => {
    //     setInterval(() => {
    //         console.log('sending', activeChat)
    //         if(activeChat)
    //             dispatch(send({chatId: activeChat, content: 'check'}))
    //     }, 10000)
    // }, [])

    const handleSend = () => {
        const content = fieldRef.current!.value

        if(/^\s*$/.test(content)){ // check if empty
            return
        }

        dispatch( send({chatId: activeChat!, content}) )
        fieldRef.current!.value = ''
    }

    return (
        <div
            className="flex-row justify-between
            w-full h-10 
            border-t border-blue-400
            
            " 
            style={{display: globalState == 'onChat' ? 'flex' : 'none'}}
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
            />
            <button
                className="w-8" 
                onClick={(e) => handleSend()}
            >&#9654;</button>
        </div>
    )
}

export default SenfField