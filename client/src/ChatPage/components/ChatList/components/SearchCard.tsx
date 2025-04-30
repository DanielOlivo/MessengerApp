import { FC } from 'react'
import { UserInfo } from 'shared/src/Types'
import { useApDispatch } from '../../../../app/hooks'
import { reqChatWithUser } from '../../../slice'
import { chatListIcons } from '../../../../assets/assets'


export const SearchCard: FC<UserInfo> = ({name, id, iconSrc}) => {

    const dispatch = useApDispatch()

    return (
        <div 
            className='flex flex-row justify-start items-center h-7 font-Montserrat text-sky-200 font-bold'
            onClick={() => dispatch(reqChatWithUser(id))}
        >
            <img src={iconSrc === '' ? chatListIcons.userIcon : iconSrc} />
            <p>{name}</p>
        </div>
    )
}
