import { useAppSelector } from "../../../../app/hooks"
import { selectChatMessages, selectCurrentChatId } from "../../../selectors"
import { TextMessage } from "./TextMessage/TextMessage"

export const Container = () => {

    const chatId = useAppSelector(selectCurrentChatId)
    const items = useAppSelector(selectChatMessages)

    return (
        <div className="flex-grow flex flex-col justify-start items-stretch bg-slate-200 px-3 pt-14 overflow-y-auto">
            <div className="w-full">
                {chatId !== '' && items.map(item => <TextMessage key={item.id} {...item} />)}
            </div>
        </div>
    )
}
