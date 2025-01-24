import { ChildrenProp } from "./ChildrenProp"

const Messages = ({children}: ChildrenProp) => {

    return (
        <div
            className="overflow-y-auto
            px-3" 
        >
            {children}
        </div>
    )
}

export default Messages