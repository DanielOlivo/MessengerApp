import { v4 as uuid } from 'uuid'
import { faker } from '@faker-js/faker';
import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Server } from "socket.io";
import { getSocketServer } from "../../../utils/getSocketServer";
import { useRState } from "../../../utils/getState";
import { createStore } from "../../../app/store";
import { Provider } from "react-redux";
import { Membership } from "./Membership";
import { UserInfoCollection } from '../../../users/slice';

describe('Membership', () => {
    
    let io: Server | undefined

    const getAddBtn = () => screen.queryByText(/Add/)
    const getRemoveBtn = () => screen.queryByText(/Remove/)

    afterEach(() => {
        if(io){
            io.close()
        }
    })

    test('onCreate: add/remove contacts', () => {
        const { state, addContact } = useRState()
        const userId = addContact()
        const userInfo = state.users.users[userId]
        state.group = { ...state.group, state: 'onCreate'}
        const store = createStore(state)
        render(<Provider store={store}><Membership /></Provider>)

        const contact = screen.getByText(new RegExp(userInfo.name))
        expect(contact).toBeInTheDocument()
         
        // only one contact, not yet in membership
        let addBtn = getAddBtn()
        let removeBtn = getRemoveBtn()
        expect(addBtn).toBeInTheDocument()
        expect(removeBtn).not.toBeInTheDocument()

        fireEvent.click(addBtn!)

        // only contact is in membership list
        removeBtn = getRemoveBtn()
        addBtn = getAddBtn()
        expect(addBtn).not.toBeInTheDocument()
        expect(removeBtn).toBeInTheDocument()

        fireEvent.click(removeBtn!)

        // contact again is not member
        addBtn = getAddBtn()
        removeBtn = getRemoveBtn()
        expect(addBtn).toBeInTheDocument()
        expect(removeBtn).not.toBeInTheDocument()
    })

    test('onCreate: search', async () => {
        const userId = uuid()
        const username = faker.internet.username()
        const res: UserInfoCollection = { [userId]: { name: username, id: userId, iconSrc: '' } }

        io = getSocketServer()
        io.on('connection', socket => {
            socket.on('searchContacts', name => {
                expect(name).toEqual(username)
                socket.emit('handleContactsSearch', res)
            })
        })

        const { state } = useRState()
        const store = createStore(state)
        render(<Provider store={store}><Membership /></Provider>)

        let field = screen.getByLabelText('contact-search-field')
        expect(field).toBeInTheDocument()
        expect(field).not.toBeDisabled()

        fireEvent.change(field, { target: {value: username}})

        await waitFor(() => expect(screen.getByText(new RegExp(username))).toBeInTheDocument())  
        expect(store.getState().group.onSearch).toBeTruthy()

        field = screen.getByLabelText('contact-search-field')
        fireEvent.change(field, { target: { value: ''}})

        expect(screen.queryByText(new RegExp(username))).not.toBeInTheDocument()
        expect(store.getState().group.onSearch).toBeFalsy()
    })

    test('onUpdate: non admin', () => {
        const { state, addContact } = useRState()
        const userId1 = addContact()
        const userid2 = addContact()
        const user1 = state.users.users[userId1]
        const user2 = state.users.users[userid2]
        state.group.inGroup = [ user1.id ]
        state.group.state = 'onUpdate'
        const store = createStore(state)

        render(<Provider store={store}><Membership /></Provider>)

        expect(screen.getByText(new RegExp(user1.name))).toBeInTheDocument()
        expect(screen.queryByText(new RegExp(user2.name))).not.toBeInTheDocument()
        expect(getAddBtn()).not.toBeInTheDocument()
        expect(getRemoveBtn()).not.toBeInTheDocument()
    })

})
