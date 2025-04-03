import { useAppSelector } from "../../../app/hooks"
import { selectPinnedItems, selectUnpinnedItems } from "../../selectors"
import { NewGroupButton } from "./components/NewGroupButton"
import { SearchBar } from "./components/SearchBar"
import { Section } from "./components/Section"

export const ChatList = () => {

    const pinned = useAppSelector(selectPinnedItems)
    const unpinned = useAppSelector(selectUnpinnedItems)

    return (
        <div className="flex flex-col justify-start items-stretch min-w-[200px] max-w-[400px] max-h-screen">
            <SearchBar />

            <div className="w-full flex-grow overflow-y-auto">
                <div className="w-full">
                    <NewGroupButton />
                    <Section title='Pinned' iconSrc='' items={pinned} />
                    <Section title='All' iconSrc='' items={unpinned} />
                </div>
            </div>
        </div>
    )
}
