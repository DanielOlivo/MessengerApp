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
import { Routes, Route } from 'react-router-dom'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { selectAuthStatus } from './Auth/selectors'


import Dialog from './components/Dialog'
import MainScreen from './components/MainScreen'
import Login from './components/auth/Login'
import Registration from './components/auth/Registration'
import AutoLogin from './components/auth/AutoLogin'

import { Typing } from './ChatPage/components/ChatView/components/Typing/Typing'
import { Initializer } from './components/Initializer'
import { Auth } from './Auth/components/Auth'
import { ChatPage } from './ChatPage/ChatPage'


// import DateMessage, { DateMessageProp } from './components/DateMessage'
// import { ReactNode } from 'react'


function App() {

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const dispatch = useApDispatch()

  // const isAuthenticated = useAppSelector(selectAuthStatus)

  return (
    <Routes>
      <Route path='/login' element={ <Auth /> } />
      <Route path='/' element={ <ChatPage /> } />
    </Routes>
  )
}

export default App