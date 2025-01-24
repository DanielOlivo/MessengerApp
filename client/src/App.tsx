import Login from './components/Login'
import Registration from './components/Registration'
import Status from './components/Status'
import { Message } from '../../types/Types'
import ChatItem from './components/ChatItem'
import ChatList from './components/ChatList'
import SearchField from './components/SearchField'
import Dialog from './components/Dialog'
import Header from './components/Header'
import MainScreen from './components/MainScreen'
import Messages from './components/Messages'
import DialogMessage from './components/DialogMessage'
import UserMessage, { UserMessageProp } from './components/UserMessage'
import SenfField from './components/SendField'
import DateMessage, { DateMessageProp } from './components/DateMessage'
import { useAppSelector } from './app/hooks'
import { selectChatList, selectChatName, selectMessages, ServiceMessage } from './features/socket/socketSlice'
import { ReactNode } from 'react'


function App() {

  const chatList = useAppSelector(selectChatList)
  const messages = useAppSelector(selectMessages)
  const chatName = useAppSelector(selectChatName)

  return (
    <MainScreen>

      <ChatList>
        <SearchField />
        {chatList.map(({name, msg, user, chatId}) => (
          <ChatItem 
            name={name || 'no name'} 
            content={msg!.content} 
            lastSenderName={user.username}
            chatId={chatId}/>
        ))}
        {/* {getSomeChatItems()} */}
      </ChatList>

      <Dialog>
        <Header name={chatName || 'none'} status='online'></Header>  

        <Messages>
          {messages.map(msg => getMessage(msg))}
        </Messages>

        <SenfField />        

      </Dialog>

    </MainScreen>
  )
}

export default App


function getMessage(arg: UserMessageProp | DateMessageProp | ServiceMessage): ReactNode {

  if('date' in arg){
    const {date}: DateMessageProp = arg
    return <DateMessage date={date} />
  }
  else if('msg' in arg){
    const {msg}: ServiceMessage = arg
    return <DialogMessage message={msg} />
  }
  else {
    const {isOwner, message, isRead}: UserMessageProp = arg
    return <UserMessage isOwner={isOwner} message={message} isRead={isRead} />
  }
}

// function getSomeChatItems() {
//   return (
//     <>
//     <ChatItem name="user1" content={'duuuude'} />
//     <ChatItem name="user2" content={'man'} />
//     <ChatItem name="user3" content={'once upon a time...'} />
//     <ChatItem name="user4" content={'give me...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     <ChatItem name="user5" content={'filler...'} />
//     </>
//   )
// }

          {/* <DialogMessage message="dialog started" />          
          <UserMessage isOwner={true} message="my message" isRead={true}/>
          <UserMessage isOwner={true} message="a bit bigger text" isRead={true}/>
          <DateMessage date={new Date()} />
          <UserMessage isOwner={true} message='"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."' isRead={false}/>
          <UserMessage isOwner={false} message='"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."' isRead={false}/>
          <UserMessage isOwner={true} message='"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."' isRead={false}/>
          <UserMessage isOwner={false} message='"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."' isRead={false}/>
          <UserMessage isOwner={true} message='"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."' isRead={false}/>
          <UserMessage isOwner={false} message='"Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."' isRead={false}/> */}