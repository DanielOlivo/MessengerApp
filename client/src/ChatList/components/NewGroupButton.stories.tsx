import type { Meta, StoryObj } from '@storybook/react';
import { NewGroupButton } from './NewGroupButton';
import { Provider } from '../../utils/Provider';

const meta = {
  title: 'ChatList/NewGroupButton',
  component: NewGroupButton,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
        <Provider>
            <div className='w-56'>
                <Story />
            </div>
        </Provider>
    )
  ],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof NewGroupButton>;

export default meta;
type Story = StoryObj<typeof NewGroupButton>;

export const Primary: Story = {}