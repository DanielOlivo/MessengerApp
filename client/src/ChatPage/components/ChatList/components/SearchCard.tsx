import { FC } from 'react'
import { UserInfo } from 'shared/src/Types'
import { useApDispatch } from '../../../../app/hooks'
import { reqChatWithUser } from '../../../slice'


export const SearchCard: FC<UserInfo> = ({name, id, iconSrc}) => {

    const dispatch = useApDispatch()

    return (
        <div 
            className='flex flex-row justify-start items-center h-7'
            onClick={() => dispatch(reqChatWithUser(id))}
        >
            <img src={iconSrc} />
            <p>{name}</p>
        </div>
    )
}
