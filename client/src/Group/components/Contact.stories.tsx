import type {Meta, StoryObj} from '@storybook/react'
import { Contact } from './Contact'

const meta = {
  title: 'Group/Contact',
  component: Contact,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Contact>

export default meta
type Story = StoryObj<typeof meta>

