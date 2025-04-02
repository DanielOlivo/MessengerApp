// import Login from './components/Login'
// import Registration from './components/Registration'
// import Status from './components/Status'
// import { Message } from '../../types/Types'
// import ChatItem from './components/ChatItem'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useEffect } from 'react'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { useApDispatch, useAppSelector } from './app/hooks'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Routes, Route, useNavigate } from 'react-router-dom'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { selectAuthStatus } from './features/auth/selectors'


import Dialog from './components/Dialog'
import MainScreen from './components/MainScreen'
import Login from './components/auth/Login'
import Registration from './components/auth/Registration'
import AutoLogin from './components/auth/AutoLogin'

import { Typing } from './ChatPage/components/ChatView/components/Typing/Typing'
import { Initializer } from './components/Initializer'


// import DateMessage, { DateMessageProp } from './components/DateMessage'
// import { ReactNode } from 'react'


function App() {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
          {/* <ChatList /> */}
          <Dialog>
            {/* <Header />   */}
            {/* <Messages /> */}
            {/* <SenfField />         */}
          </Dialog>
        </MainScreen>
        {/* <GroupControl /> */}
        </>

      } />
    </Routes>


    {/* {getOverlayed()} */}
    </>
  )
}

export default App