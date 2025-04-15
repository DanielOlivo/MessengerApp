import type {Meta, StoryObj} from '@storybook/react'
import { Auth } from './Auth'
import { http, HttpResponse } from 'msw'
import { v4 as uuid } from 'uuid'
import { getState } from '../../utils/getState'
import { createStore } from '../../app/store'
import { Provider } from 'react-redux'
import { BrowserRouter } from 'react-router-dom'

const meta = {
  title: 'Auth/Auth',
  component: Auth,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Auth>

export default meta
type Story = StoryObj<typeof meta>

const url = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

const { state } = getState()
const store = createStore(state)

export const Primary: Story = {
  decorators: [
    (Story) => (
      <BrowserRouter>
        <Provider store={store} >
          <div className='w-[500px] h-[500px]'>
            <Story />
          </div>
        </Provider>
      </BrowserRouter>
    )
  ],
  parameters: {
    msw: {
      handlers: [
        http.post(new URL('/api/user/login', url).href, () => {
          return HttpResponse.json({
            username: 'user',
            userId: uuid(),
            token: 'sometoken'
          })
        })
      ]
    }
  }
}