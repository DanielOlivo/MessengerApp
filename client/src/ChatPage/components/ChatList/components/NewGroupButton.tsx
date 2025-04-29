import { useApDispatch } from "../../../../app/hooks"
import { setCreate } from "../../../../ChatControl/slice"

export const NewGroupButton = () => {

    const dispatch = useApDispatch()

    return (
        <div className="flex flex-row justify-center items-center h-9 my-2">
            <button 
                className="p-3  text-sm font-Montserrat text-sky-300 font-bold"
                onClick={() => dispatch(setCreate())}
                aria-label="new-group-btn"
            >New Group</button>
        </div>
    )
}
