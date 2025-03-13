import type {Meta, StoryObj} from '@storybook/react'
import { Section } from './Section'
import { getChatItem } from '../../utils/getChatItem'
import { Provider } from '../../utils/Provider'

const meta = {
  title: 'ChatList/Section',
  component: Section,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Section>

export default meta
type Story = StoryObj<typeof Section>

export const Primary: Story = {
    args: {
        title: 'Section',
        iconSrc: '',
        items: Array.from({length: 3}, () => getChatItem())
    },
    decorators: [
      (Story) => <Provider><Story /></Provider>
    ]
}