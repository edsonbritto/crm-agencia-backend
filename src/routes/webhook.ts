import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.post('/whatsapp', async (req, res) => {
  const body = req.body
  const event = body.event
  const data = body.data

  if (event === 'messages.upsert') {
    const msg = data.messages?.[0]
    if (!msg || msg.key?.fromMe) return res.sendStatus(200)

    const phone = msg.key.remoteJid?.replace('@s.whatsapp.net', '')
    const text = msg.message?.conversation || 
                 msg.message?.extendedTextMessage?.text || 
                 '(mídia)'

    if (!phone || !text) return res.sendStatus(200)

    let lead = await prisma.lead.findFirst({ where: { phone } })
    if (!lead) {
      lead = await prisma.lead.create({
        data: { name: `WhatsApp ${phone}`, phone, stage: 'novo' }
      })
    }

    await prisma.message.create({
      data: { leadId: lead.id, from: 'them', text }
    })

    console.log(`📱 Nova mensagem de ${phone}: ${text}`)
  }

  res.sendStatus(200)
})

export default router
