import React, { useRef } from 'react'
import { useApDispatch, useAppSelector } from '../app/hooks'
import { ApplyInput } from './components/ApplyInput'
import { NameField } from './components/NameField'
import { Membership } from './components/Membership'
import { selectIsGroup } from './selectors'

export const Controls = () => {

    const description = "some description"
    const isGroup = useAppSelector(selectIsGroup)

    return (
        <div>
            <NameField />
            <p>{description}</p>
            {isGroup && <Membership />}
            <ApplyInput />
        </div>
    )
}
