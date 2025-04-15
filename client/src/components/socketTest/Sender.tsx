import React, { useEffect } from 'react'
import { useApDispatch, useAppSelector } from '../../app/hooks'
import { sendNumber } from '../../ChatPage/slice'
import { initSocket } from '../../features/socket/socketSlice'
import { selectConnectionStatus } from '../../features/socket/selectors'


export const Sender = () => {

    const dispatch = useApDispatch()

    const isConnected = useAppSelector(selectConnectionStatus)

    useEffect(() => {
        const timeout = setTimeout(() => dispatch(initSocket()), 2000)

        const interval = setInterval(() => {
            dispatch(sendNumber(1))
        }, 3000)
        return () => {
            clearInterval(interval)
            clearTimeout(timeout)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div>Sender: {isConnected ? 'connected' : 'not connected'}</div>
    )
}
