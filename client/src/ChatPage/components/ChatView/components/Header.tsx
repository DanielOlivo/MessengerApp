import { useAppSelector } from "../../../../app/hooks"
import { Icon } from "../../../../common/Icon"
import { selectHeaderInfo } from '../../../selectors'


export const Header = () => {

    const { name, iconSrc, status } = useAppSelector(selectHeaderInfo)

    return (
        <div className="flex flex-row justify-between items-center h-16 px-4 py-2">

            <div className="flex flex-row justify-start items-center">
                <Icon iconSrc={iconSrc} isOnline={false}/>                
                <div className="flex flex-col items-start justify-between ml-3">
                    <p>{name}</p>
                    <p>{status}</p>
                </div>
            </div>

            <div>

            </div>
        </div>
    )
}
