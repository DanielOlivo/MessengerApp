import { ChildrenProp } from "./ChildrenProp"

const Dialog = ({children}: ChildrenProp) => {
    return (
        <div
            className="flex flex-col 
            w-2/3 min-h-full
            " 
        >
            {children}
        </div>
    )
}

export default Dialog