import { useApDispatch, useAppSelector } from '../../../app/hooks'
import { leaveGroup, deleteGroup, setIdle, createGroup } from '../../slice'
import { selectChatId, selectGroupMemberIds, selectIsAdmin, selectIsGroup, selectName, selectState } from '../../selectors'
import { selectUserId } from '../../../Auth/selectors'

export const ApplyInput = () => {

    const dispatch = useApDispatch()

    const userId = useAppSelector(selectUserId)

    const chatId = useAppSelector(selectChatId)
    const isGroup = useAppSelector(selectIsGroup)
    const isAdmin = useAppSelector(selectIsAdmin)
    const state = useAppSelector(selectState)

    const name = useAppSelector(selectName)
    const inGroup = useAppSelector(selectGroupMemberIds)

    if(state === 'onCreate'){
        return (
            <div 
                className='flex flex-row justify-center items-center'
                aria-label='apply-input'
            >
                <button
                    onClick={() => dispatch(createGroup({
                        name, 
                        admin: [ userId],
                        members: inGroup
                    }))} 
                >Create</button>
            </div>
        )
    }

    if(!isGroup){
        return (
            <div 
                className='flex flex-row justify-start items-center h-5'
                aria-label='apply-input'
            >
                <button
                    onClick={() => dispatch(setIdle())} 
                >Ok</button>
            </div>
        )
    }

    // onUpdate
    return (
        <div
            aria-label='apply-input'
        >
            <button
                onClick={() => dispatch(leaveGroup({chatId, userId, actor: userId}))} 
            >Leave</button>
            {isAdmin && (
                <button
                    onClick={() => dispatch(deleteGroup({ chatId, actor: userId }))} 
                >Delete</button>
            )}
            <button
                onClick={() => dispatch(setIdle())} 
            >Ok</button>
        </div>
    )
}
