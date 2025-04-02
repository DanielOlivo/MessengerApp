import type {Meta, StoryObj} from '@storybook/react'
import { Container } from './Container'
import { Provider } from '../../../../utils/Provider'
import { getState } from '../../../../utils/getState'

const meta = {
  title: 'ChatView/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof Container>

const state = getState()
const chatId = Object.keys(state.chat.chatInfo)[0]
state.chat.displayedChatId = chatId

export const Primary: Story = {
    decorators: [
        (Story) => <Provider state={state}>
          <div className='min-w-[500px] h-[500px] flex flex-row items-stretch'>
            <Story />
          </div>
        </Provider>
    ]
}