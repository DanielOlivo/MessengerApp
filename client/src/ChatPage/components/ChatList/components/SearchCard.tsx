import { FC } from 'react'
import { UserInfo } from 'shared/src/Types'


export const SearchCard: FC<UserInfo> = ({name, userId, iconSrc}) => {
    return (
        <div 
            className='flex flex-row justify-start items-center h-7'
            onClick={() => {console.log(userId)}}
        >
            <img src={iconSrc} />
            <p>{name}</p>
        </div>
    )
}
