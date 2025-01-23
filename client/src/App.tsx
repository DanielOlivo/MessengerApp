import Login from './components/Login'
import Registration from './components/Registration'
import Status from './components/Status'
import { Message } from '../../types/Types'
import ChatItem from './components/ChatItem'

function App() {

  const last: Message = {
    id: '1',
    chatId: '1',
    userId: '1',
    content: 'hey, dude',
    created: new Date()
  }

  return (
    <div>
      <div>App</div>
      
      <ChatItem name="dm" lst={last} />

      <Status />
      <Registration />
      <Login />    
    </div>
  )
}

export default App
