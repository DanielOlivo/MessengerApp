import type {Meta, StoryObj} from '@storybook/react'
import { Icon } from './Icon'
import { getRandomIcon } from '../utils/getRandomIcon'

const meta = {
  title: 'common/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof Icon>


export const Primary: Story = {
    args: getRandomIcon()
}
