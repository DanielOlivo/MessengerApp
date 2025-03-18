import type { Meta, StoryObj } from '@storybook/react';
import { ChatInput } from './ChatInput';
import { Provider } from '../../../utils/Provider';

const meta = {
  title: 'ChatView/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <Provider>
            <div className='w-80'>
                <Story />
            </div>
        </Provider>
    )
  ],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof ChatInput>;

export default meta;
type Story = StoryObj<typeof ChatInput>;

export const Primary: Story = {}