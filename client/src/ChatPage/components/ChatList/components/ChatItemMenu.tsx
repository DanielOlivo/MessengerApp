import { FC } from 'react'
import { useApDispatch } from '../../../../app/hooks'
import { deleteChat, togglePin } from '../../../slice'
import { ChatId } from 'shared/src/Types'

export interface ChatItemMenuProps {
    chatId: ChatId
    pinned: boolean
}

export const ChatItemMenu: FC<ChatItemMenuProps> = ({chatId, pinned}) => {

    const dispatch = useApDispatch()

    return (
        <div className='flex flex-col justify-start items-stretch w-24 border border-slate-400 rounded-md p-1 bg-white'>
            <button aria-label='chat-item-menu-toggle' onClick={() => dispatch(togglePin(chatId))}>{pinned ? 'Unpin' : 'Pin'}</button>
            <button aria-label='chat-item-menu-delete' onClick={() => dispatch(deleteChat(chatId))}>Delete</button>
        </div>
    )
}
