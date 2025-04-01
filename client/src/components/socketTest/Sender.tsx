import React, { useEffect, useRef } from 'react'
import { useApDispatch, useAppSelector } from '../../app/hooks'
import { sendNumber } from '../../ChatPage/slice'
import { connectionEstablished, initSocket } from '../../features/socket/socketSlice'
import { selectConnectionStatus } from '../../features/socket/selectors'


export const Sender = () => {

    const dispatch = useApDispatch()

    const isConnected = useAppSelector(selectConnectionStatus)

    useEffect(() => {
        const interval = setInterval(() => {
            dispatch(initSocket())
            dispatch(sendNumber(1))
        }, 3000)
        return () => clearInterval(interval)
    }, [])

    return (
        <div>Sender: {isConnected ? 'connected' : 'not connected'}</div>
    )
}
