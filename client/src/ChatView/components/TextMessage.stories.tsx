import type {Meta, StoryObj} from '@storybook/react'
import { TextMessage } from './TextMessage'
import { faker } from '@faker-js/faker'

const meta = {
  title: 'ChatView/TextMessage',
  component: TextMessage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => <div className='bg-slate-200 p-2'><Story /></div>
  ]
} satisfies Meta<typeof TextMessage>

export default meta
type Story = StoryObj<typeof TextMessage>

export const IsOwn: Story = {
    args: {
        isOwn: true,
        timestamp: '00:00',
        text: faker.lorem.paragraph()
    },
}

export const IsntOwn: Story = {
    args: {
        isOwn: false,
        timestamp: '00:00',
        text: faker.lorem.paragraph()
    },
}