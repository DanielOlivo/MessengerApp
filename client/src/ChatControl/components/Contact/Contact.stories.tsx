import type {Meta, StoryObj} from '@storybook/react'
import { Contact, ContactProps } from './Contact'
import { getRandomHumanIcon } from '../../../assets/assets'
import { faker } from '@faker-js/faker'
import { Provider } from '../../../utils/Provider'

const meta = {
  title: 'Group/Contact',
  component: Contact,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  // More on argTypes: https://storybook.js.org/docs/api/argtypes
} satisfies Meta<typeof Contact>

export default meta
type Story = StoryObj<typeof meta>

const props: ContactProps = {
      userId: '',
      editable: false,
      iconSrc: getRandomHumanIcon(),
      name: faker.internet.username(),
      inGroup: false
}


export const NonEdible: Story = {
    args: {...props, editable: false},
    decorators: [(Story) => <Provider><Story /></Provider>]
}

export const EdibleInGroup: Story = {
    args: {...props, editable: true, inGroup: true},
    decorators: [(Story) => <Provider><Story /></Provider>]
}

export const EdibleNotInGroup: Story = {
    args: {...props, editable: true, inGroup: false},
    decorators: [(Story) => <Provider><Story /></Provider>]
}