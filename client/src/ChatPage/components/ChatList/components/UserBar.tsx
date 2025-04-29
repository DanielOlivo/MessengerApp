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
        <div className="flex flex-row items-center justify-between h-9 px-4 py-3 font-Montserrat text-sky-200 font-bold">
            <p>{username}</p>
            <button
                onClick={handleLogout} 
            >Logout</button>
        </div>
    )
}
