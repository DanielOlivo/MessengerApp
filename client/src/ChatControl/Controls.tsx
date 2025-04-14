import React, { useRef } from 'react'
import { useApDispatch, useAppSelector } from '../app/hooks'
import { ApplyInput } from './components/ApplyInput/ApplyInput'
import { NameField } from './components/NameField/NameField'
import { Membership } from './components/Membership/Membership'
import { selectIsGroup } from './selectors'

export const Controls = () => {

    const description = "some description"
    const isGroup = useAppSelector(selectIsGroup)

    return (
        <div
            aria-label='chat-control' 
        >
            <NameField />
            <p>{description}</p>
            {isGroup && <Membership />}
            <ApplyInput />
        </div>
    )
}
