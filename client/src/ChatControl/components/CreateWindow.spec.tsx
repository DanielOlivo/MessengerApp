import { v4 as uuid } from "uuid";
import { describe, test, expect } from "vitest";
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { useRState } from "../../utils/getState";
import { createStore } from "../../app/store";
import { Provider } from "react-redux";
import { ChatList } from "../../ChatPage/components/ChatList/ChatList";
import { getSocketServer } from "../../utils/getSocketServer";
import { faker } from "@faker-js/faker";
import { UserInfo } from "shared/src/Types";

describe('Create group window', () => {
    
    test('creating new group', async() => {

        const info: UserInfo = {
            id: uuid(),
            name: faker.internet.username(),
            iconSrc: ''
        }

        const collection = { [info.id]: info }

        const io = getSocketServer() 
        io.on('connection', socket => {
            socket.on('searchContacts', term => {
                socket.emit('handleContactsSearch', collection)
            })
        })

        const { state, addContact } = useRState()
        const userId = addContact()
        const store = createStore(state, false)

        render(<Provider store={store}><ChatList /></Provider>)

        const btn = screen.getByLabelText('new-group-btn')
        expect(btn).toBeInTheDocument()

        fireEvent.click(btn)

        const window = screen.getByLabelText('create-group-window')
        expect(window).toBeInTheDocument()
        expect(screen.getByText(/All contacts/)).toBeInTheDocument() 
        expect(screen.queryByText(/Member/)).not.toBeInTheDocument()

        expect(screen.getByText(new RegExp(state.users.users[userId].name))).toBeInTheDocument()
        
        let addBtn = screen.getByText(/Add/)
        expect(addBtn).toBeInTheDocument()

        fireEvent.click(addBtn)

        expect(screen.queryByText(/Add/)).not.toBeInTheDocument()

        const removeBtn = screen.getByText(/Remove/)
        expect(removeBtn).toBeInTheDocument()

        fireEvent.click(removeBtn) 
        expect(screen.queryByText(/Remove/)).not.toBeInTheDocument()

        addBtn = screen.getByText(/Add/)
        expect(addBtn).toBeInTheDocument()
        
        fireEvent.click(addBtn)

        const nameField = screen.getByLabelText('group-name')  
        expect(nameField).toBeInTheDocument()
        fireEvent.change(nameField, { target: { value: 'some group'}})
                 
        const contactField = screen.getByLabelText('contact-search-field')
        expect(contactField).toBeInTheDocument()        
        fireEvent.change(contactField, { target: { value: 'some contact '}}) 

        await waitFor(() => expect(screen.queryByText(new RegExp(info.name, 'i'))).toBeInTheDocument())  
        const contact = screen.getByText(new RegExp(info.name))

                

        io.close()
    })


})