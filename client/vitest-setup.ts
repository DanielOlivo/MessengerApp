import '@testing-library/jest-dom/vitest'
import { server } from './tests/server'
// import { vi } from 'vitest'

// vi.mock('socket.io-client', () => {
//     const emit = vi.fn()
//     const on = vi.fn()
//     const socket = { emit, on }
//     return {
//         default: vi.fn(() => socket)
//     }
// })

// beforeAll() => {
//     server.listen()
// }

// afterEach(() => {
//     server.resetHandlers()
// })

// afterAll(() => {
//     server.close()
// })