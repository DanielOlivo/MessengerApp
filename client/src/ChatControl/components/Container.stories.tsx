import { Meta, StoryObj } from "@storybook/react";
import { Container } from "./Container";
import { Provider } from "../../utils/Provider";

const meta = {
  title: 'Group/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Container>

export default meta
type Story = StoryObj<typeof meta>

export const Primary: Story = {
    args: {
        children:<div className="w-32 h-32 border border-black">SOMe content</div>
    },
    decorators: [
        (Story) => (
            <Provider>
                <div className="w-[500px] h-72">
                    <Story />
                </div>
            </Provider>
        )
    ]
}
