import type {Meta, StoryObj} from '@storybook/react'
import { MessageContainer } from './MessageContainer'

const meta = {
  title: 'ChatView/MessageContainer',
  component: MessageContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => <div className='bg-slate-200 w-72 p-2'><Story /></div>
  ],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof MessageContainer>

export default meta
type Story = StoryObj<typeof MessageContainer>

export const IsOwn: Story = {
    args: {
        isOwn: true,
        timestamp: '00:00',
        children: <div>CHILDREN</div>
    }
}

export const IsntOwn: Story = {
    args: {
        isOwn: false,
        timestamp: '00:00',
        children: <div>CHILDREN</div>
    }
}