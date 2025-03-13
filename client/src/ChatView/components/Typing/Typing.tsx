import dayjs from "dayjs"
import { useAppSelector } from "../../../app/hooks"
import { selectTyping } from "../../selectors"
import { join } from "./utils"

export const Typing = () => {

    const typings = useAppSelector(selectTyping)
    const toDisplay = typings
        .filter(item => dayjs().subtract(item.timestamp, 'milliseconds').valueOf() < 2000)
        .map(item => item.username)

    if(toDisplay.length === 0){
        return null
    }

    if(toDisplay.length === 1){
        return (
            <div>
                <p>{toDisplay[0]} is typing...</p>
            </div>
        )
    }

    return (
        <div>
            <p>{join( toDisplay )} are typing...</p>
        </div>
    )
}
