import dayjs from "dayjs"
import { useAppSelector } from "../../../../../app/hooks"
import { join } from "./utils"
import { selectTypingForContainer } from "../../../../selectors"

export const Typing = () => {

    const typings = useAppSelector(selectTypingForContainer)
    // const toDisplay = typings
    //     .filter(item => dayjs().subtract(item.timestamp, 'milliseconds').valueOf() < 2000)
    //     .map(item => item.username)

    if(typings.length === 0){
        return null
    }

    if(typings[0].length === 1){
        return (
            <div>
                <p>{typings[0]} is typing...</p>
            </div>
        )
    }

    return (
        <div>
            <p>{join( typings )} are typing...</p>
        </div>
    )
}
