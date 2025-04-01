import type {Meta, StoryObj} from '@storybook/react'
import { CreateWindow } from './CreateWindow'
import { Provider } from '../../utils/Provider'
import { Provider as RProvider } from 'react-redux'
import { createStore } from '../../app/store'
import { getState } from '../../utils/getState'
import { getRandomUsers } from '../../users/utils'

const meta = {
  title: 'Group/Create',
  component: CreateWindow,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof CreateWindow>

export default meta
type Story = StoryObj<typeof meta>

export const WhenJustOpened: Story = {
    decorators: [
        (Story) => (
            <Provider>
                <div className='w-72 h-72 border border-black'>
                    <Story />
                </div>
            </Provider>
        )
    ]
}

const users = getRandomUsers()
const inGroup = Object.keys(users).slice(0, 5)

const store = createStore(getState({
    users: { users } ,
    group: { 
        state: 'onCreate',
        groupId: '',
        isAdmin: false,
        inGroup ,
        onSearch: false,
        searchResult: []
    }
}))

// console.log(store.getState())

export const WhenSomeAdded: Story = {
    decorators: [
        (Story) => (
            <RProvider store={store}>
                <div className='w-72 h-72 border border-black'>
                    <Story />
                </div>
            </RProvider>
        )
    ]
}