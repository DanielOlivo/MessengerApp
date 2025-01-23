import { useSelector } from "react-redux"
import { useApDispatch, useAppSelector } from "../app/hooks"
import { initSocket, say, selectStatus } from "../features/socket/socketSlice"
import { useEffect } from "react"

const Status = () => {
    const status = useAppSelector( selectStatus )
    const dispatch = useApDispatch()
    

    useEffect(() => {
        // setTimeout(() => {
        //     dispatch(initSocket())
        // }, 1000)

        setInterval(() => {
            dispatch(say('hey, dude'))
        }, 3000)
    }, [])

    return (
        <div>
            <h1>status {status}</h1>
        </div>
    )
}

export default Status