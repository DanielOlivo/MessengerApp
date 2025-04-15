import { Meta, StoryObj } from "@storybook/react";
import { ApplyInput } from "./ApplyInput";
import { getState } from "../../../utils/getState";
import { Provider } from "react-redux";
import { createStore } from "../../../app/store";

const meta = {
  title: 'ChatControl/ApplyInput',
  component: ApplyInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof ApplyInput>

export default meta
type Story = StoryObj<typeof meta>

// eslint-disable-next-line
const { state: state1 } = getState()
state1.group.isGroup = false

export const OnDM: Story = {
    decorators: [
        (Story) => <Provider store={createStore(state1)}><Story /></Provider>
    ]
}

// eslint-disable-next-line
const { state: state2 } = getState()
state2.group.isGroup = true
state2.group.isAdmin = false
export const OnGroupNonAdmin: Story = {
    decorators: [
        (Story) => <Provider store={createStore(state2)}><Story /></Provider>
    ]
}


// eslint-disable-next-line
const { state: state3 } = getState()
state3.group.isGroup = true
state3.group.isAdmin = true
export const OnGroupIsAdmin: Story = {
    decorators: [
        (Story) => <Provider store={createStore(state3)}><Story /></Provider>
    ]
}