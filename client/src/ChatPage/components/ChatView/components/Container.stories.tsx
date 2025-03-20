import type {Meta, StoryObj} from '@storybook/react'
import { Container } from './Container'
import { Provider } from '../../../../utils/Provider'
import { getItems } from '../../../../utils/textMessageGen'
import { getState } from '../../../../utils/getState'

const meta = {
  title: 'ChatView/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof Container>

const items = getItems()
const chatId = Object.keys(items)[0]


const state = getState({
  chatView2: {
    items, 
    chatId
  }
})

export const Primary: Story = {
    decorators: [
        (Story) => <Provider state={state}>
          <div className='min-w-[500px] h-[500px] flex flex-row items-stretch'>
            <Story />
          </div>
        </Provider>
    ]
}