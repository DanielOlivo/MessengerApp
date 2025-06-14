import type { Meta, StoryObj } from '@storybook/react';
import { Provider } from '../utils/Provider';
import { ChatPage } from './ChatPage';
import { BrowserRouter } from 'react-router-dom';

const meta = {
  title: 'ChatPage/ChatPage',
  component: ChatPage,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof ChatPage>;

export default meta;
type Story = StoryObj<typeof ChatPage>;

export const Primary: Story = {
    decorators: [
        (Story) => (
          <BrowserRouter>
            <Provider>
                <Story />
            </Provider>
          </BrowserRouter>
        )
    ]
}