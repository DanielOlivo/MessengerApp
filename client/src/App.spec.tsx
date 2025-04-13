import '@testing-library/react/dont-cleanup-after-each'

import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { AppStore, createStore, RootState } from './app/store';
import { useRState } from './utils/getState';
import App from './App';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';

describe('App', () => {

    let clientState: RootState 
    let clientStore: AppStore

    const getUsernameField = () => screen.getByLabelText('username-field')
    const getPasswordField = () => screen.getByLabelText('password-field')
    const getSwitchButton = () => screen.getByLabelText('switch-button')

    beforeAll(() => {

        const { state } = useRState()
        clientState = state

        clientStore = createStore(clientState) 

        render(
            <BrowserRouter>
                <Provider store={clientStore}>
                    <App />
                </Provider>
            </BrowserRouter>
        )
    })

    afterAll(() => {

    })

    test('start with Auth page', () => {
        const header = screen.queryByText(/Messenger App/)
        expect(header).toBeInTheDocument()
    })

    test('Auth: on login', async () => {
        const loginHeader = screen.queryByText(/Login/)
        expect(loginHeader).toBeInTheDocument()
    })

    test('Auth: contains username and passord field', () => {
        const usernameField = getUsernameField()
        const passwordField = getPasswordField()
        expect(usernameField).toBeInTheDocument()
        expect(passwordField).toBeInTheDocument()

    })

    test('Auth: contains switch button', () => {
        const btn = getSwitchButton()
        expect(btn).toBeInTheDocument()
    })

    test('Auth: switch to register', () => {
        const btn = getSwitchButton()
        fireEvent.click(btn)

        const header = screen.getByText(/Register/)
        expect(header).toBeInTheDocument()
    })

    test('Auth: switch back to Login', () => {
        const btn = getSwitchButton()
        expect(btn).toBeInTheDocument()
        fireEvent.click(btn)
        const header = screen.getByText(/Login/)
        expect(header).toBeInTheDocument()
    })

    test('Auth: login to account', async () => {
        
    }) 

})