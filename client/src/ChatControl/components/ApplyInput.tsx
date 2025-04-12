import { useApDispatch, useAppSelector } from '../../app/hooks'
import { leaveGroup, removeGroup, setIdle } from '../slice'
import { selectChatId, selectIsAdmin, selectIsGroup } from '../selectors'

export const ApplyInput = () => {

    const dispatch = useApDispatch()

    const chatId = useAppSelector(selectChatId)
    const isGroup = useAppSelector(selectIsGroup)
    const isAdmin = useAppSelector(selectIsAdmin)
    const state = 'onCreate' // 'onUpdate'


    if(!isGroup){
        return (
            <div className='flex flex-row justify-start items-center h-5'>
                <button
                    onClick={() => dispatch(setIdle())} 
                >Ok</button>
            </div>
        )
    }

    if(state === 'onCreate'){
        <div className='flex flex-row justify-center items-center'>
            <button>Create</button>
        </div>
    }

    // onUpdate
    return (
        <div>
            <button
                onClick={() => dispatch(leaveGroup(chatId))} 
            >Leave</button>
            {isAdmin && (
                <button
                    onClick={() => dispatch(removeGroup(chatId))} 
                >Delete</button>
            )}
            <button
                onClick={() => dispatch(setIdle())} 
            >Ok</button>
        </div>
    )
}
