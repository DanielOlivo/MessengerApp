import { useAppSelector } from "../app/hooks"
import { SearchBar } from "./components/SearchBar"
import { Section } from "./components/Section"
import { selectPinned, selectUnpinned } from "./selectors"

export const ChatList = () => {

    const pinned = useAppSelector(selectPinned)
    const unpinned = useAppSelector(selectUnpinned)

    return (
        <div className="flex flex-col justify-start">
            <SearchBar />

            <Section iconSrc="" title='pinned' items={pinned} />
            <Section iconSrc="" title='all' items={unpinned} />
        </div>
    )
}
