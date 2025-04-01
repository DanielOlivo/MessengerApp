import type {Meta, StoryObj} from '@storybook/react'
import { UserList } from './components/UserList'

const meta = {
  title: 'Group/UserList',
  component: UserList,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof UserList>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {}