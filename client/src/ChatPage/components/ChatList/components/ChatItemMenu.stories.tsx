import type { Meta, StoryObj } from '@storybook/react';
import { ChatItemMenu } from './ChatItemMenu';
import { Provider } from '../../../../utils/Provider';

const meta = {
  title: 'ChatList/ChatItemMenu',
  component: ChatItemMenu,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
} satisfies Meta<typeof ChatItemMenu>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Pinned: Story = {
    args: {
        pinned: true
    },
    decorators: [
        (Story) => <Provider><Story /></Provider>
    ]
}

export const Unpinned: Story = {
    args: {
        pinned: false
    },
    decorators: [
        (Story) => <Provider><Story /></Provider>
    ]
}