import { useApDispatch, useAppSelector } from "../../../../app/hooks"
import { selectUsername } from "../../../../Auth/selectors"
import { logout } from "../../../../Auth/slice"

export const UserBar = () => {
    const username = useAppSelector(selectUsername) 

    const dispatch = useApDispatch()

    const handleLogout = () => {
        dispatch(logout())
    } 

    return (
        <div className="flex flex-row items-center justify-between">
            <p>{username}</p>
            <button
                onClick={handleLogout} 
            >Logout</button>
        </div>
    )
}
