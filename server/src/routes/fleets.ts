import express from 'express'
import { fleets } from '../mocks/fleets'
import { CreateFleetData, Fleet } from '@agentfleet/types'

const router = express.Router()

// GET /api/fleets
router.get('/', (req, res) => {
  res.json(fleets)
})

// GET /api/fleets/:id
router.get('/:id', (req, res) => {
  const fleet = fleets.find((f) => f.id === req.params.id)
  if (!fleet) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  res.json(fleet)
})

// POST /api/fleets
router.post('/', (req, res) => {
  const data = req.body as CreateFleetData
  const fleet: Fleet = {
    id: (fleets.length + 1).toString(),
    name: data.name,
    description: data.description,
    status: 'active',
    agents: data.agents || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  fleets.push(fleet)
  res.status(201).json(fleet)
})

// PUT /api/fleets/:id
router.put('/:id', (req, res) => {
  const data = req.body as Partial<CreateFleetData>
  const index = fleets.findIndex((f) => f.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  fleets[index] = {
    ...fleets[index],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  res.json(fleets[index])
})

// DELETE /api/fleets/:id
router.delete('/:id', (req, res) => {
  const index = fleets.findIndex((f) => f.id === req.params.id)
  if (index === -1) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  fleets.splice(index, 1)
  res.status(204).send()
})

export default router
