import type {Meta, StoryObj} from '@storybook/react'
import { ChatItem } from './ChatItem'
import { faker } from '@faker-js/faker'
import { Provider } from '../../../../utils/Provider'
import { getRandomHumanIcon } from '../../../../assets/assets'

const meta = {
  title: 'ChatList/ChatItem',
  component: ChatItem,
  parameters: {
    layout: 'centered',
  },
  decorators: [
    (Story) => (
      <Provider>
        <div className='bg-sky-600 p-3'>
          <Story />
        </div>
      </Provider>
    )
  ],
  tags: ['autodocs'],
} satisfies Meta<typeof ChatItem>

export default meta
type Story = StoryObj<typeof ChatItem>

export const Primary: Story = {
    args: {
        chatId: '',
        title: faker.person.fullName(),
        content: faker.lorem.sentence(),
        iconSrc: getRandomHumanIcon() ,
        unseenCount: 0,
        selected: false
    }
}

export const Selected: Story = {
    args: {
        chatId: '',
        title: faker.person.fullName(),
        content: faker.lorem.sentence(),
        iconSrc: getRandomHumanIcon(),
        unseenCount: 0,
        selected: true
    }
}

export const NoIcon: Story = {
    args: {
        chatId: '',
        title: faker.person.fullName(),
        content: faker.lorem.sentence(),
        iconSrc: '',
        unseenCount: 0,
        selected: true
    }
}