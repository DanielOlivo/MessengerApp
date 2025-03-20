import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from '../../../utils/Provider';
import { ChatView } from './ChatView';

const meta = {
  title: 'ChatView/ChatView',
  component: ChatView,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof ChatView>;

export default meta;
type Story = StoryObj<typeof ChatView>;

export const Primary: Story = {
    decorators: [
        (Story) => (
          <Provider>
            <div className='w-[500px] h-[500px]'>
              <Story />
            </div>
          </Provider>
        )
    ]
}