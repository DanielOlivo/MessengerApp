import type {Meta, StoryObj} from '@storybook/react'
import { ChatList } from './ChatList'
import { Provider } from '../utils/Provider'

const meta = {
  title: 'ChatList/ChatList',
  component: ChatList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof ChatList>

export default meta
type Story = StoryObj<typeof ChatList>

export const Primary: Story = {
    decorators: [
      (Story) => <Provider><Story /></Provider>
    ]
}