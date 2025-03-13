import { useAppSelector } from "../../app/hooks"
import { Icon } from "../../common/Icon"
import { selectHeader } from "../selectors"


export const Header = () => {

    const {iconSrc, title} = useAppSelector(selectHeader)

    return (
        <div className="flex flex-row justify-between items-center h-16">

            <div className="flex flex-row justify-start items-center">
                <Icon iconSrc={iconSrc} isOnline={false}/>                
                <div className="flex flex-col items-start justify-between">
                    <p>{title}</p>
                </div>
            </div>

            <div>

            </div>
        </div>
    )
}
