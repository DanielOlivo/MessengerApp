import { FC } from 'react'
import { useApDispatch, useAppSelector } from '../../app/hooks'
import { selectContactsInGroup, selectChatId, selectGroupName } from '../selectors'
import { Contact } from './Contact'
import { deleteGroup } from '../slice'

export const UpdateWindow: FC = () => {

    const dispatch = useApDispatch()
    const chatId = useAppSelector(selectChatId)
    const members = useAppSelector(selectContactsInGroup) 
    const groupName = useAppSelector(selectGroupName)

    return (
        <div className='flex flex-col justify-start items-start'>
            <p>{groupName}</p>
            <div className='overflow-y-auto'>
                <div>
                    {members.map(member => <Contact key={member.userId} {...member} />)}
                </div>
            </div>
            <div className='flex flex-row justify-between items-center'>
                <button>Apply</button>
                <button className='text-red-500' onClick={() => dispatch(deleteGroup(chatId))}>Remove group</button>
            </div>
        </div>
    )
}
