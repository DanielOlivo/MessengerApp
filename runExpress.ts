import app from './app'
import {createServer} from 'http'

const server = createServer(app)


server.listen(3000, () => {
    console.log('http://localhost:')
})

console.log(server.address())