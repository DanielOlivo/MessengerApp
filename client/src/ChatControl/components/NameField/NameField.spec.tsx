import { describe, test, expect } from "vitest";
import { fireEvent, render, screen } from '@testing-library/react'
import { getState } from "../../../utils/getState";
import { createStore } from "../../../app/store";
import { Provider } from "react-redux";
import { NameField } from "./NameField";

describe('NameField', () => {
    test('field is disabled when dm', () => {
        const { state } = getState()
        state.group.isGroup = false
        const store = createStore(state)
        render(<Provider store={store}><NameField /></Provider>)
        const field = screen.getByLabelText('chat-control-name-field')
        expect(field).toBeInTheDocument()
        expect(field).toBeDisabled()
    })

    test('field is disabled when chat is group, but user is not admin', () => {
        const { state } = getState()
        state.group.isGroup = true
        state.group.isAdmin = false
        const store = createStore(state)
        render(<Provider store={store}><NameField /></Provider>)
        const field = screen.getByLabelText('chat-control-name-field')
        expect(field).toBeInTheDocument()
        expect(field).toBeDisabled()
    })

    test('field is enabled when chat is group and user is admin', () => {
        const { state } = getState()
        state.group.isGroup = true
        state.group.isAdmin = true
        const store = createStore(state)
        render(<Provider store={store}><NameField /></Provider>)
        const field = screen.getByLabelText('chat-control-name-field')
        expect(field).toBeInTheDocument()
        expect(field).not.toBeDisabled()
    })

    test('field value affects store state', () => {
        const { state } = getState()
        state.group = {...state.group, isAdmin: true, isGroup: true}
        const store = createStore(state)

        render(<Provider store={store}><NameField /></Provider>)

        const field = screen.getByLabelText('chat-control-name-field')
        expect(field).toBeInTheDocument()
        expect(field).not.toBeDisabled()

        fireEvent.change(field, { target: { value: 'hello' }})

        expect(store.getState().group.name).toEqual('hello')
    })
})