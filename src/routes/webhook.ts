import { Router } from 'express'
import { prisma } from '../lib/prisma'

const router = Router()

router.post('/whatsapp', async (req, res) => {
  const body = req.body
  const event = body.event || body.type || ''
  const data = body.data || body

  const messages = data.messages || body.messages
  if (!messages || !messages.length) return res.sendStatus(200)

  const msg = messages[0]
  if (!msg || msg.key?.fromMe) return res.sendStatus(200)

  const phone = msg.key.remoteJid?.replace('@s.whatsapp.net', '').replace('@c.us', '')
  const text = msg.message?.conversation ||
               msg.message?.extendedTextMessage?.text ||
               msg.message?.imageMessage?.caption ||
               '(midia)'

  if (!phone || !text) return res.sendStatus(200)

  const contactName = (msg.pushName && msg.pushName.trim())
    ? msg.pushName.trim()
    : `WhatsApp ${phone}`

  let lead = await prisma.lead.findFirst({ where: { phone } })
  if (!lead) {
    lead = await prisma.lead.create({
      data: { name: contactName, phone, stage: 'novo' }
    })
  } else if (lead.name.startsWith('WhatsApp ') && !contactName.startsWith('WhatsApp ')) {
    lead = await prisma.lead.update({
      where: { id: lead.id },
      data: { name: contactName }
    })
  }

  await prisma.message.create({
    data: { leadId: lead.id, from: 'them', text }
  })

  console.log(`📱 ${contactName} (${phone}): ${text}`)
  res.sendStatus(200)
})

export default router
