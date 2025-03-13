import dayjs from "dayjs"
import { useAppSelector } from "../../app/hooks"
import { selectTyping } from "../selectors"

export const Typing = () => {

    const {username, timestamp} = useAppSelector(selectTyping)

    if(dayjs().valueOf() - timestamp > 2000){
        return null
    }

    return (
        <div>
            <p>{username} is typing...</p>
        </div>
    )
}
