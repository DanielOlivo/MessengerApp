// import Login from './components/Login'
// import Registration from './components/Registration'
// import Status from './components/Status'
// import { Message } from '../../types/Types'
// import ChatItem from './components/ChatItem'
import { useEffect } from 'react'
import ChatList from './components/chatList/ChatList'
import Dialog from './components/Dialog'
import Header from './components/chatView/Header'
import MainScreen from './components/MainScreen'
import Messages from './components/chatView/Messages'
// import DialogMessage from './components/DialogMessage'
// import UserMessage, { UserMessageProp } from './components/UserMessage'
import SenfField from './components/chatView/SendField'
import { useApDispatch, useAppSelector } from './app/hooks'
// import { initSocket, unselectChat } from './features/socket/socketSlice'
// import Overlay from './components/Overlay'
// import { selectOverlayed } from './features/socket/selectors'
// import { setState } from './features/state/stateSlice'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Login from './components/auth/Login'
import Registration from './components/auth/Registration'
import AutoLogin from './components/auth/AutoLogin'
import { selectAuthStatus } from './features/auth/selectors'
import { resetChatView } from './features/chatView/chatViewSlice'
import { resetHeader } from './features/header/headerSlice'
import GroupControl from './components/groupControl/GroupControl'

import { Typing } from './ChatPage/components/ChatView/components/Typing/Typing'
import { Initializer } from './components/Initializer'
import { Sender } from './components/socketTest/Sender'


// import DateMessage, { DateMessageProp } from './components/DateMessage'
// import { ReactNode } from 'react'


function App() {

  const dispatch = useApDispatch()
  // const overlayed = useAppSelector(selectOverlayed)
  // const navigate = useNavigate()
  // const isAuthenticated = useAppSelector(selectAuthStatus)

  // const getOverlayed = () => overlayed ? <Overlay /> : <></>

  // useEffect(() => {
  //   document.addEventListener('keyup', (e) => {
  //     // console.log(e.key)

  //     if(e.key === 'Escape'){
  //       console.log('escape')
  //       // dispatch(setState('idle'))
  //       // dispatch(unselectChat())
  //       dispatch(resetChatView())
  //       dispatch(resetHeader())
  //     }
  //   })

  //   // dispatch(initSocket())
  // }, [])

  // DO NOT REMOVE
  // useEffect(() => {
  //   navigate(isAuthenticated ? '/' : '/login')
  // }, [isAuthenticated])

  return (
    <>
      <Initializer /> 
      {/* <Sender /> */}
      <Typing />
    </>
  )

  return (
    <>

    <Routes>
      <Route path='/login' element={ 
        <>
          <Login /> 
          <AutoLogin  /> {/* <AutoLogin username='user1' password='1234' /> */}
        </> }
      />
      <Route path='/register' element={ <Registration /> } />
      <Route path='/' element={
        <>
        <MainScreen>
          <ChatList />
          <Dialog>
            <Header />  
            <Messages />
            <SenfField />        
          </Dialog>
        </MainScreen>
        <GroupControl />
        </>

      } />
    </Routes>


    {/* {getOverlayed()} */}
    </>
  )
}

export default App


// function getMessage(arg: UserMessageProp | DateMessageProp | ServiceMessage): ReactNode {

//   if('date' in arg){
//     const {date}: DateMessageProp = arg
//     return <DateMessage date={date} />
//   }
//   else if('msg' in arg){
//     const {msg}: ServiceMessage = arg
//     return <DialogMessage message={msg} />
//   }
//   else {
//     const {isOwner, message, isRead}: UserMessageProp = arg
//     return <UserMessage isOwner={isOwner} message={message} isRead={isRead} />
//   }
// }

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