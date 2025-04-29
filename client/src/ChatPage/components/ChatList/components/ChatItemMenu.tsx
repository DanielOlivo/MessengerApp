import { FC } from 'react'
import { useApDispatch } from '../../../../app/hooks'
import { deleteChat, togglePin } from '../../../slice'
import { ChatId } from 'shared/src/Types'
import { disable } from '../../../../Context/slice'

export interface ChatItemMenuProps {
    chatId: ChatId
    pinned: boolean
}

const buttonStyle = 'hover:bg-sky-700'

export const ChatItemMenu: FC<ChatItemMenuProps> = ({chatId, pinned}) => {

    const dispatch = useApDispatch()

    return (
        <div className='flex flex-col justify-start items-stretch w-24 border border-sky-200 rounded-md p-1 bg-sky-950 text-sky-200 font-Montserrat font-bold'>
            <button 
                aria-label='chat-item-menu-toggle' 
                className={buttonStyle}
                onClick={() => {
                    dispatch(togglePin(chatId))
                    dispatch(disable())
                }}
            >{pinned ? 'Unpin' : 'Pin'}</button>
            <button 
                aria-label='chat-item-menu-delete' 
                className={buttonStyle}
                onClick={() => {
                    dispatch(deleteChat(chatId))
                    dispatch(disable())
                }}
            >Delete</button>
        </div>
    )
}
