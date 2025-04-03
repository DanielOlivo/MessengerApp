import React, { FC } from 'react'
import { useApDispatch } from '../../../../app/hooks'

export interface ChatItemMenuProps {
    pinned: boolean
}

export const ChatItemMenu: FC<ChatItemMenuProps> = ({pinned}) => {

    const dispatch = useApDispatch()

    return (
        <div className='flex flex-col justify-start items-stretch'>
            <button>{pinned ? 'Unpin' : 'Pin'}</button>
            <button>Delete</button>
        </div>
    )
}
