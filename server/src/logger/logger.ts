import pino from "pino";

const transport = pino.transport({
    targets: [{
            target: 'pino/file',
            options: { destination: `./logs/app.log`},
            level: 'trace',
        },
        {
            target: 'pino-pretty',
            level: 'trace'
        }

    ]
})

const logger = pino({
        level: 'trace',
        // formatters: {

        // }
        timestamp: pino.stdTimeFunctions.isoTime
    }, 
    transport
)

export default logger