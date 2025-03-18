import { Header } from "./components/Header"
import { Container } from "./components/Container"

export const ChatView = () => {
  return (
    <div className="h-full flex flex-col justify-start items-stretch">
      <Header />
      <Container />
    </div>
  )
}
