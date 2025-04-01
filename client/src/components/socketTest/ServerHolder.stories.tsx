import type {Meta, StoryObj} from '@storybook/react'
import { ServerHolder } from './ServerHolder'

const meta = {
  title: 'testing/serverholder',
  component: ServerHolder,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof ServerHolder>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
    decorators: [
        (Story) => <div><Story /></div>
    ]
}