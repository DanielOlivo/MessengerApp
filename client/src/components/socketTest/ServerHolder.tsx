import React, { useEffect, useRef } from 'react'
import { createServer } from 'node:http'
import { Server } from 'socket.io'

export const ServerHolder = () => {

    useEffect(() => {
        const httpServer = createServer()
        // const io = new Server(httpServer)
        // httpServer.listen(() => {
        //     io.on('connection', (socket) => {
        //         console.log('new connection', socket)
        //     })
        // })

        // return () => {
        //     io.close()
        //     console.log('disconnecting')
        // }
    },[])

    return <></>
}
