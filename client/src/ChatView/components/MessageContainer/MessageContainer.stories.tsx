import { faker } from '@faker-js/faker'
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
} satisfies Meta<typeof MessageContainer>

export default meta
type Story = StoryObj<typeof MessageContainer>

export const IsOwn: Story = {
    args: {
        isOwn: true,
        timestamp: '00:00',
        children: <div>CHILDREN</div>,
        status: 'seen'
    }
}

export const IsntOwn: Story = {
    args: {
        isOwn: false,
        timestamp: '00:00',
        children: <div>CHILDREN</div>,
        status: 'seen'
    }
}

export const IsOwnSeen: Story = {
    args: {
        isOwn: true,
        timestamp: '00:00',
        children: <div>{faker.lorem.paragraph()}</div>,
        status: 'seen'
    }
}

export const IsOwnUnseen: Story = {
    args: {
        isOwn: true,
        timestamp: '00:00',
        children: <div>{faker.lorem.paragraph()}</div>,
        status: 'unseen'
    }
}

export const IsOwnPending: Story = {
    args: {
        isOwn: true,
        timestamp: '00:00',
        children: <div>{faker.lorem.paragraph()}</div>,
        status: 'pending'
    }
}