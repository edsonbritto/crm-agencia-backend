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

app.get('/qr', (req, res) => {
  res.send(`<!DOCTYPE html>
<html><body style="background:#111;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;flex-direction:column;font-family:sans-serif">
<h2 style="color:white">Escanear WhatsApp</h2>
<div id="qr" style="background:white;padding:20px;border-radius:12px;margin:20px 0;min-width:280px;min-height:280px;display:flex;align-items:center;justify-content:center">
<p style="color:#333">Carregando...</p></div>
<p id="status" style="color:#888"></p>
<script>
async function load() {
  const r = await fetch('http://localhost:8080/instance/connect/agencia',{headers:{'apikey':'meucrm123'}});
  const d = await r.json();
  if(d.base64){document.getElementById('qr').innerHTML='<img src="'+d.base64+'" style="width:280px">';document.getElementById('status').textContent='Pronto!';}
  else{document.getElementById('status').textContent=JSON.stringify(d);}
}
load();setInterval(load,25000);
</script></body></html>`)
})

io.on('connection', (socket) => {
  console.log('cliente conectado:', socket.id)
})

httpServer.listen(3001, () => {
  console.log('✅ API rodando em http://localhost:3001')
})
