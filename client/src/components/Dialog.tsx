import { ChildrenProp } from "./ChildrenProp"

const Dialog = ({children}: ChildrenProp) => {
    return (
        <div
            className="flex flex-col
            w-2/3
            " 
        >
            {children}
        </div>
    )
}

export default Dialog