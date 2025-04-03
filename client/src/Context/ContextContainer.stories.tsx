import { Meta, StoryObj} from '@storybook/react'
import { ContextContainer } from './ContextContainer'
import { createStore } from '../app/store'
import { getState } from '../utils/getState'
import { Provider } from 'react-redux'

const meta = {
  title: 'Context/Container',
  component: ContextContainer,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof ContextContainer>

export default meta
type Story = StoryObj<typeof meta>

const store = createStore(getState())

export const Primary: Story = {
    args: {
        type: 'chatItem',
        id: '11',
        children: <div className='w-48 h-48 bg-slate-500' >some content</div>,
        getMenu: () => <div>MENU!!!</div>
    },
    decorators: [
        (Story) => <Provider store={store}><Story /></Provider>
    ]
}