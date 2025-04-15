import React from 'react'
import { useApDispatch, useAppSelector } from '../../../../../app/hooks'
import { selectEditButtonArg } from '../../../../../ChatControl/selectors'
import { setEdit } from '../../../../../ChatControl/slice'

export const ChatInfoButton = () => {

    const dispatch = useApDispatch()
    const editArg = useAppSelector(selectEditButtonArg)

    return (
        <div
            aria-label='chat-info-button' 
            onClick={() => dispatch(setEdit(editArg))}
        >
            Edit
        </div>
    )
}
