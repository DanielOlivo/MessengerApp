import type {Meta, StoryObj} from '@storybook/react'
import { NameField } from './NameField'
import { getState } from '../../../utils/getState'
import { Provider } from 'react-redux'
import { createStore } from '../../../app/store'

const meta = {
  title: 'ChatControl/NameField',
  component: NameField,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof NameField>

export default meta
type Story = StoryObj<typeof meta>

const { state: state1 } = getState()
state1.group = {
    ...state1.group,
    name: 'some chat name',
    isGroup: false
}
export const OnDM: Story = {
    decorators: [
        (Story) => <Provider store={createStore(state1)}><Story /></Provider>
    ]
}

const { state: state2 } = getState()
state2.group = {
    ...state2.group,
    isAdmin: false,
    isGroup: true,
    name: 'i am group and you are not an admin'
}
export const onGroupNotAdmin: Story = {
    decorators: [
        (Story) => <Provider store={createStore(state2)}><Story /></Provider>
    ]
}


const { state: state3 } = getState()
state3.group = {
    ...state3.group,
    isAdmin: true,
    isGroup: true,
    name: 'its a group and you are admin'
}
export const onGroupAndAdmin: Story = {
    decorators: [
        (Story) => <Provider store={createStore(state3)}><Story /></Provider>
    ]
}