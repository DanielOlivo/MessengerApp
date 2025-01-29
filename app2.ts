import express, { Request, Response } from 'express'

const app = express()
const port = process.env.PORT || 3000

console.log(port)

app.get('/', (req: Request, res: Response) => {
    res.sendStatus(200)
})

app.listen(port, () => console.log('listen ' + port))