import { v4 as uuid } from "uuid";
import { describe, test, expect } from "vitest";
import { fireEvent, render, screen } from '@testing-library/react'
import { useRState } from "../../../utils/getState";
import { createStore } from "../../../app/store";
import { Provider } from "react-redux";
import { Contact, ContactProps } from "./Contact";
import { faker } from "@faker-js/faker";

describe('Contact', () => {
    
    const props: ContactProps = {
        userId: uuid(),
        editable: false,
        inGroup: false,
        name: faker.internet.username(),
        iconSrc: ''
    }

    test('render, not edible', () => {
        const { state } = useRState()
        const store = createStore(state)

        render(<Provider store={store}><Contact {...{...props, editable: false, inGroup: false}} /></Provider>)

        expect(screen.getByText(props.name)).toBeInTheDocument()
        expect(screen.queryByText(/Add/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Remove/)).not.toBeInTheDocument()
    })

    test('render, edible, not in group', () => {
        const { state } = useRState()
        const store = createStore(state)

        render(<Provider store={store}><Contact {...{...props, editable: true, inGroup: false}} /></Provider>)

        expect(screen.getByText(props.name)).toBeInTheDocument()
        expect(screen.queryByText(/Add/)).toBeInTheDocument()
        expect(screen.queryByText(/Remove/)).not.toBeInTheDocument()
    })

    test('render, edible, in group', () => {
        const { state } = useRState()
        const store = createStore(state)

        render(<Provider store={store}><Contact {...{...props, editable: true, inGroup: true}} /></Provider>)

        expect(screen.getByText(props.name)).toBeInTheDocument()
        expect(screen.queryByText(/Add/)).not.toBeInTheDocument()
        expect(screen.queryByText(/Remove/)).toBeInTheDocument()
    })

    test('adding to group', () => {
        const { state, addContact } = useRState()
        const userId = addContact()
        const store = createStore(state)

        const props = {
            userId,
            editable: true,
            inGroup: false,
            name: state.users.users[userId].name,
            iconSrc: ''
        }

        render(<Provider store={store}><Contact {...props} /></Provider>)

        const addBtn = screen.getByText(/Add/)
        fireEvent.click(addBtn)

        const inGroup = store.getState().group.inGroup
        expect(inGroup.length).toEqual(1)
    })

    test('removing to group', () => {
        const { state, addContact } = useRState()
        const userId = addContact()
        state.group.inGroup = [ userId ]
        const store = createStore(state)


        const props = {
            userId,
            editable: true,
            inGroup: true,
            name: state.users.users[userId].name,
            iconSrc: ''
        }

        render(<Provider store={store}><Contact {...props} /></Provider>)

        let inGroup = store.getState().group.inGroup
        expect(inGroup.length).toEqual(1)

        const removeBtn = screen.getByText(/Remove/)
        fireEvent.click(removeBtn)

        inGroup = store.getState().group.inGroup
        expect(inGroup.length).toEqual(0)
    })



})