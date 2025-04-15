import { useApDispatch } from "../../../../app/hooks"
import { setCreate } from "../../../../ChatControl/slice"

export const NewGroupButton = () => {

    const dispatch = useApDispatch()

    return (
        <div className="flex flex-row justify-center items-center h-9 my-2">
            <button 
                className="border-2 border-dashed p-3  border-slate-500 rounded-3xl text-sm"
                onClick={() => dispatch(setCreate())}
                aria-label="new-group-btn"
            >New Group</button>
        </div>
    )
}
