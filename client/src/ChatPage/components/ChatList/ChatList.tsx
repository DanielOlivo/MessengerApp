import { useEffect } from "react"
import { useApDispatch, useAppSelector } from "../../../app/hooks"
import { selectChatInfo, selectPinnedItems, selectUnpinnedItems } from "../../selectors"
import { NewGroupButton } from "./components/NewGroupButton"
import { SearchBar } from "./components/SearchBar"
import { Section } from "./components/Section"
import { initLoading } from "../../slice"
import { requestUsers } from "../../../users/slice"
import { selectAllUsers, selectIsOnSearch, selectSearchResultItems } from "../../../users/selectors"
import { SearchCard } from "./components/SearchCard"
import { initSocket } from "../../../features/socket/socketSlice"
import { UserBar } from "./components/UserBar"
import { selectConnectionStatus } from "../../../features/socket/selectors"

export const ChatList = () => {

    const onSearch = useAppSelector(selectIsOnSearch)
    const searchResult = useAppSelector(selectSearchResultItems)
    const pinned = useAppSelector(selectPinnedItems)
    const unpinned = useAppSelector(selectUnpinnedItems)

    // console.log('SEARCH RESULT', searchResult)

    const dispatch = useApDispatch()

    const users = useAppSelector(selectAllUsers)
    const chatInfos = useAppSelector(selectChatInfo)
    const isConnected = useAppSelector(selectConnectionStatus)

    useEffect(() => {
        if(!isConnected){
            dispatch(initSocket())
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if(isConnected && Object.keys(users).length > 0 && Object.keys(chatInfos).length > 0){
            return
        }
        dispatch(requestUsers())
        dispatch(initLoading())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isConnected])

    return (
        <div 
            className="h-full flex flex-col justify-start items-stretch min-w-[200px] max-w-[400px] max-h-screen bg-sky-900"
            aria-label="chat-list"
        >
            <UserBar />

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
