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


app.post('/api/disconnect', async (req, res) => {
  const whatsappUrl = process.env.WHATSAPP_API_URL || process.env.URL_API_DO_WHATSAPP || 'http://localhost:8080'
  const whatsappKey = process.env.WHATSAPP_API_KEY || process.env.CHAVE_API_DO_WHATSAPP || 'meucrm123'
  try {
    await fetch(`${whatsappUrl}/instance/logout/agencia`, {
      method: 'DELETE',
      headers: { 'apikey': whatsappKey }
    })
    res.json({ ok: true })
  } catch(e) {
    res.json({ ok: false })
  }
})

app.get('/api/whatsapp/status', async (req, res) => {
  const whatsappUrl = process.env.WHATSAPP_API_URL || process.env.URL_API_DO_WHATSAPP || 'http://localhost:8080'
  const whatsappKey = process.env.WHATSAPP_API_KEY || process.env.CHAVE_API_DO_WHATSAPP || 'meucrm123'
  try {
    const r = await fetch(`${whatsappUrl}/instance/connectionState/agencia`, {
      headers: { 'apikey': whatsappKey }
    })
    const d = await r.json()
    res.json({ state: d?.instance?.state || 'unknown' })
  } catch(e) {
    res.json({ state: 'error' })
  }
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`✅ API rodando na porta ${PORT}`)
})
