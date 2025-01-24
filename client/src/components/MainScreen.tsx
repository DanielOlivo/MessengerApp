import { ChildrenProp } from "./ChildrenProp"

const MainScreen = ({children}: ChildrenProp) => {

    return (
        <div
            className="flex flex-row w-screen h-screen" 
        >
            {children}
        </div>
    )
}

export default MainScreen