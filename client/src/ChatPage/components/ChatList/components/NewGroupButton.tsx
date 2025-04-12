import { createPortal } from "react-dom"
import { useApDispatch, useAppSelector } from "../../../../app/hooks"
import { selectState } from "../../../../ChatControl/selectors"
import { CreateWindow } from "../../../../ChatControl/components/CreateWindow"
import { setCreate } from "../../../../ChatControl/slice"

export const NewGroupButton = () => {

    const dispatch = useApDispatch()
    const state = useAppSelector(selectState)

    return (
        <div className="flex flex-row justify-center items-center h-9 my-2">
            <button 
                className="border-2 border-dashed p-3  border-slate-500 rounded-3xl text-sm"
                onClick={() => dispatch(setCreate())}
                aria-label="new-group-btn"
            >New Group</button>

            {state === 'onCreate' && createPortal(
                <div className="w-full h-full bg-[rgba(200,200,200, 0.3)] flex justify-center items-center">
                    <CreateWindow /> 
                </div>
            , document.body)}
        </div>
    )
}
