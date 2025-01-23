import { httpServer } from "./socketServer"

const port = process.env.PORT || 3000

httpServer.listen(port, () => console.log('http://localhost:' + port))