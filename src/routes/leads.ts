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

export default router
