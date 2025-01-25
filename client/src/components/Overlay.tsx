import { useApDispatch } from "../app/hooks";
import { removeOverlay } from "../features/socket/socketSlice";
import { ChildrenProp } from "./ChildrenProp";

const Overlay = ({children}: ChildrenProp) => {

    const dispatch = useApDispatch()

    return (
        <div
            className="absolute top-0 left-0 w-screen h-screen bg-slate-400 opacity-30
            flex flex-row justify-center items-center 
            " 
        >
            <div
                className="w-72 h-80 bg-white rounded-xl p-2 flex flex-col" 
            >
                <div // header
                    className="flex flex-row-reverse justify-start h-8 w-full" 
                >
                    <button
                        onClick={(e) => {
                            e.preventDefault()
                            dispatch(removeOverlay())
                        }} 
                    >Close</button>
                </div>
                <div>{children}</div>
            </div>
        </div>
    )
}

export default Overlay