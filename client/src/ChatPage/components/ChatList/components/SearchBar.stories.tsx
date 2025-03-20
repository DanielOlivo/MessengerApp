import type { Meta, StoryObj } from '@storybook/react';
import { SearchBar } from './SearchBar';
import { Provider } from '../../../../utils/Provider';

const meta = {
  title: 'ChatList/SearchBar',
  component: SearchBar,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => 
      <Provider>
        <div className='w-60'>
          <Story />
        </div>
      </Provider>
  ],
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} satisfies Meta<typeof SearchBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {}