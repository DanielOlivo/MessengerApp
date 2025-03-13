import type {Meta, StoryObj} from '@storybook/react'
import { DateSeparator } from "../../ChatView/components/DateSeparator";

const meta = {
  title: 'ChatView/DateSeparator',
  component: DateSeparator,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof DateSeparator>

export default meta
type Story = StoryObj<typeof DateSeparator>

export const Primary: Story = {
    args: {
        timestamp: "September 12:20, 2024"
    }
}

