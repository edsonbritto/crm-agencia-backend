import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import leadsRouter from './routes/leads'
import webhookRouter from './routes/webhook'

const app = express()
const httpServer = createServer(app)
const io = new Server(httpServer, {
  cors: { origin: '*' }
})

app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/leads', leadsRouter)
app.use('/webhook', webhookRouter)

io.on('connection', (socket) => {
  console.log('cliente conectado:', socket.id)
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`)
})
