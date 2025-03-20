import type {Meta, StoryObj} from '@storybook/react'
import { Provider } from '../../../../utils/Provider'
import { Header } from './Header'

const meta = {
  title: 'ChatView/Header',
  component: Header,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Header>

export default meta
type Story = StoryObj<typeof Header>

export const Primary: Story = {
  decorators: [
    (Story) => (
      <Provider>
        <div className='w-[500px] border border-black'>
          <Story />
        </div>
      </Provider>
    )
  ]
}
