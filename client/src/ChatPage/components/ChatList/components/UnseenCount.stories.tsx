import type {Meta, StoryObj} from '@storybook/react'
import { UnseenCount } from './UnseenCount'

const meta = {
  title: 'ChatList/UnseenCount',
  component: UnseenCount,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof UnseenCount>

export default meta
type Story = StoryObj<typeof UnseenCount>

export const One: Story = {
    args: {
        count: 1
    }
}

export const Ten: Story = {
    args: {
        count: 10
    }
}

export const Hundred: Story = {
    args: {
        count: 100
    }
}