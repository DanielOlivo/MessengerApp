import type {Meta, StoryObj} from '@storybook/react'
import { Sample } from './Sample'

const meta = {
    component: Sample
} satisfies Meta<typeof Sample>

export default meta
type Story = StoryObj<typeof Sample>

export const Primary: Story = {}