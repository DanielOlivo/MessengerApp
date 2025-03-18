import { useAppSelector } from "../app/hooks"
import { ChatItem } from "./components/ChatItem"
import { SearchBar } from "./components/SearchBar"
import { selectItems } from "./selectors"

export const ChatList = () => {

    const items = useAppSelector(selectItems)

    return (
        <div className="flex flex-col justify-start items-stretch min-w-[200px] max-w-[400px] max-h-screen">
            <SearchBar />

            <div className="w-full flex-grow overflow-y-auto">
                <div className="w-full">
                    {items.map(item => <ChatItem {...item} />)}
                </div>
            </div>
        </div>
    )
}
