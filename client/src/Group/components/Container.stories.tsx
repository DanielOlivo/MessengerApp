import { Meta, StoryObj } from "@storybook/react";
import { Container } from "./Container";

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
