import { useEffect } from "react"
import { useApDispatch, useAppSelector } from "../../../app/hooks"
import { selectPinnedItems, selectUnpinnedItems } from "../../selectors"
import { NewGroupButton } from "./components/NewGroupButton"
import { SearchBar } from "./components/SearchBar"
import { Section } from "./components/Section"
import { initLoading } from "../../slice"
import { requestUsers } from "../../../users/slice"
import { selectIsOnSearch, selectSearchResultItems } from "../../../users/selectors"
import { SearchCard } from "./components/SearchCard"

export const ChatList = () => {

    const onSearch = useAppSelector(selectIsOnSearch)
    const searchResult = useAppSelector(selectSearchResultItems)
    const pinned = useAppSelector(selectPinnedItems)
    const unpinned = useAppSelector(selectUnpinnedItems)

    const dispatch = useApDispatch()

    useEffect(() => {
        setTimeout(() => {
            dispatch(requestUsers())
            dispatch(initLoading())
        }, 100)
    }, [])

    return (
        <div 
            className="flex flex-col justify-start items-stretch min-w-[200px] max-w-[400px] max-h-screen"
            aria-label="chat-list"
        >

            <SearchBar />

            <div className="w-full flex-grow overflow-y-auto">
                <div className="w-full">
                    {onSearch ? (
                        <div className="flex flex-col justify-start">
                            <p>Search result</p>
                            {searchResult.map(item => <SearchCard key={item.id} {...item} />)}
                        </div>
                    ) : (
                        <>
                            <NewGroupButton />
                            <Section title='Pinned' iconSrc='' items={pinned} />
                            <Section title='All' iconSrc='' items={unpinned} />
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
