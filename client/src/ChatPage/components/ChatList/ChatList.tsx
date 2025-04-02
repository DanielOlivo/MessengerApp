import { useAppSelector } from "../../../app/hooks"
import { selectChatItems } from "../../selectors"
import { ChatItem } from "./components/ChatItem"
import { NewGroupButton } from "./components/NewGroupButton"
import { SearchBar } from "./components/SearchBar"

export const ChatList = () => {

    // const items = useAppSelector(selectItems)
    const items = useAppSelector(selectChatItems)

    return (
        <div className="flex flex-col justify-start items-stretch min-w-[200px] max-w-[400px] max-h-screen">
            <SearchBar />

            <div className="w-full flex-grow overflow-y-auto">
                <div className="w-full">
                    <NewGroupButton />
                    {items.map(item => <ChatItem {...item} />)}
                </div>
            </div>
        </div>
    )
}
