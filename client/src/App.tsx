import { Routes, Route } from 'react-router-dom'
import { Auth } from './Auth/components/Auth'
import { ChatPage } from './ChatPage/ChatPage'

function App() {

  return (
    <Routes>
      <Route path='/login' element={ <Auth /> } />
      <Route path='/' element={ <ChatPage /> } />
    </Routes>
  )
}

export default App