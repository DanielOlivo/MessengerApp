import { ReactNode, useEffect } from "react"
import ChatItem, { ChatItemProp } from "./ChatItem"
import SearchField from "./SearchField"
import { useApDispatch, useAppSelector } from "../../app/hooks"
import { selectChatList, selectListState, selectSearchResult } from "../../features/chatList/selectors"
import { reqList } from "../../features/chatList/chatListSlicer"
import { useSelector } from "react-redux"
import { selectConnectionStatus } from "../../features/socket/selectors"
import UserItem from "./UserItem"
import { openGroupControl } from "../../features/group/groupSlice"

export interface ChatListProp {
    children?: ReactNode
}

const ChatList = () => {

    const dispatch = useApDispatch()
    const isConnected = useSelector(selectConnectionStatus)
    const chatList = useAppSelector(selectChatList)

    const listState = useAppSelector(selectListState)
    const searchResult = useAppSelector(selectSearchResult) 

    useEffect(() => {
        if(isConnected){
            console.log('reqList running...')
            setTimeout(() => dispatch(reqList()), 1000)
        }
        // setTimeout(() => dispatch(reqList()), 1000)
    },[isConnected])

    useEffect(() => {
        // function wait(ms:number){
        //     return new Promise(res => setTimeout(res, ms))
        // }
        // if(chatList.length == 0){
        //     (async function(){
        //         while(chatList.length == 0){
        //             dispatch(reqList())
        //             await wait(2000)
        //         }
        //     })()
        // }
    },[chatList])


    const onList = () => 
        <>
            {chatList.map(({username, content, chatName, chatId, unreadCount}) => 
                <ChatItem chatName={chatName} content={content} username={username} chatId={chatId} unreadCount={unreadCount}/>)}
        </>

    const onSearch = () => 
        <>
            {searchResult!.map(({username, id}) => 
                <UserItem username={username} id={id}/>)}
        </>

    return (
        <div
            className="flex flex-col justify-start w-1/3 h-screen overflow-y-auto
            border-r border-blue-300 
            " 
        >
            <SearchField />
            <button
                className="text-blue-600 text-sm" 
                onClick={(e) => dispatch(openGroupControl())}
            >Add group</button>
            {listState == 'list' ? onList() : onSearch()}
            {/* {chatList.map(({username, content, chatName, chatId, unreadCount}) => 
                <ChatItem chatName={chatName} content={content} username={username} chatId={chatId} unreadCount={unreadCount}/>)} */}
        </div>
    )
}

export default ChatList