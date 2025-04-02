import { FC, useEffect } from "react"
import { useApDispatch } from "../app/hooks"
import { initSocket } from "../features/socket/socketSlice"

export const Initializer: FC = () => {

    const dispatch = useApDispatch()


    useEffect(() => {
        dispatch(initSocket())
    }, [])

    return null
}
