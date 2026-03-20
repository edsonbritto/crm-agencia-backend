import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.get('/', async (req, res) => {
  const leads = await prisma.lead.findMany({
    include: { messages: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(leads)
})

router.post('/', async (req, res) => {
  const lead = await prisma.lead.create({ data: req.body })
  res.json(lead)
})

router.patch('/:id', async (req, res) => {
  const lead = await prisma.lead.update({
    where: { id: req.params.id },
    data: req.body
  })
  res.json(lead)
})


router.post('/:id/send', async (req, res) => {
  const { id } = req.params
  const { text } = req.body

  const lead = await prisma.lead.findUnique({ where: { id } })
  if (!lead || !lead.phone) return res.status(404).json({ error: 'Lead não encontrado' })

  const whatsappUrl = process.env.WHATSAPP_API_URL || process.env.URL_API_DO_WHATSAPP || 'http://localhost:8080'
  const whatsappKey = process.env.WHATSAPP_API_KEY || process.env.CHAVE_API_DO_WHATSAPP || 'meucrm123'

  try {
    const response = await fetch(`${whatsappUrl}/message/sendText/agencia`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': whatsappKey },
      body: JSON.stringify({
        number: lead.phone,
        textMessage: { text }
      })
    })
    const data = await response.json()

    await prisma.message.create({
      data: { leadId: id, from: 'me', text }
    })

    res.json({ ok: true, data })
  } catch (err) {
    res.status(500).json({ error: 'Erro ao enviar mensagem' })
  }
})


router.get('/:id/messages', async (req, res) => {
  const { id } = req.params
  const messages = await prisma.message.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'asc' }
  })
  res.json(messages)
})

export default router
