import React, {FC} from 'react'
import { useApDispatch } from '../../../app/hooks'
import { addToGroup, removeFromGroup } from '../../slice'

export interface ContactProps {
    userId: string
    editable: boolean
    inGroup: boolean
    name: string 
    iconSrc: string
}

export const Contact: FC<ContactProps> = ({userId, editable, inGroup, name, iconSrc}) => {

    const dispatch = useApDispatch()

    return (
        <div className='w-full h-8 flex flex-row justify-between items-center'>
            <img src={iconSrc}  className='w-7 h-7 rounded-full'/>

            <label className='flex-grow'>{name}</label>

            {
                !editable ? null :
                inGroup ? <button className='text-red-500' onClick={() => dispatch(removeFromGroup(userId))}>Remove</button> :
                <button className='text-green-500' onClick={() => dispatch(addToGroup(userId))}>Add</button>
            }

        </div>
    )
}
