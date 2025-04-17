import { describe, it, expect } from '@jest/globals'
import { getEmpty, getNonTrackedState, getState, ServerState } from './state'

describe('state', () => {

    it('state: getEmpty', () => {
        const state = getEmpty()
        expect(['users', 'messages', 'chatMessageIds', 'members', 'admins'].every(field => field in state)).toBeTruthy()
    })

    it('state: getState', () => {
        const result = getNonTrackedState()
        expect(['state'].every(field => field in result)).toBeTruthy()
    })

    it('state: create random users', () => {
        const { createRandomUsers } = getNonTrackedState()
        const ids = createRandomUsers(10)
        expect(ids.length).toEqual(10)
    })

    it('state: createRandomDms', () => {
        const { state, createRandomUsers, createRandomDms} = getNonTrackedState()
        createRandomUsers()
        const chatIds = createRandomDms() 
        expect(chatIds.length > 0).toBeTruthy()
        expect(state.members.size > 0).toBeTruthy()
        expect(state.messages.size > 0).toBeTruthy()
    })

    it('sanity check', () => expect(true).toBeTruthy()) 

})