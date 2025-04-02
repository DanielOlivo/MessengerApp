import type {Meta, StoryObj} from '@storybook/react'
import { UpdateWindow } from './UpdateWindow'
import { Provider } from '../../utils/Provider'
import { Initializer } from '../../components/Initializer'

const meta = {
  title: 'Group/Update',
  component: UpdateWindow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof UpdateWindow>

export default meta
type Story = StoryObj<typeof meta>

export const WhenNotAdmin: Story = {
    decorators: [
        (Story) => (
            <Provider>
                <Initializer />
                <Story />
            </Provider>
        )
    ]
}

export const WhenAdmin: Story = {
    decorators: [
        (Story) => <Provider><Story /></Provider>
    ]
}