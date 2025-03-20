import type {Meta, StoryObj} from '@storybook/react'
import { Typing } from './Typing'
import { Provider } from 'react-redux'
import { createStore } from '../../../../../app/store'
import { getState } from '../../../../../utils/getState'
import { getActiveTyping } from './utils'

const meta = {
  title: 'ChatView/Typing',
  component: Typing,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof Typing>

export default meta
type Story = StoryObj<typeof Typing>

const someoneTypingStore = createStore(getState({
    chatView2: {
        chatId: '1',
        typing: {
            '1': [ getActiveTyping() ] 
        }
    }
}))

export const SomeoneTyping: Story = {
    decorators: [
        (Story) => <Provider store={someoneTypingStore}><Story /></Provider>
    ]
}



const bothTypingStore = createStore(getState({
    chatView2: {
        chatId: '1',
        typing: {
            '1': [ getActiveTyping(), getActiveTyping() ] 
        }
    }
}))

export const BothTyping: Story = {
    decorators: [
        (Story) => <Provider store={bothTypingStore}><Story /></Provider>
    ]
}



const manyTypingStore = createStore(getState({
    chatView2: {
        chatId: '1',
        typing: {
            '1': Array.from({length: 4}, () => getActiveTyping())
        }
    }
}))

export const ManyTyping: Story = {
    decorators: [
        (Story) => <Provider store={manyTypingStore}><Story /></Provider>
    ]
}