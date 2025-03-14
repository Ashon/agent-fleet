import { CreateFleetData } from '@agentfleet/types'
import express from 'express'
import { MockFleetRepository } from '../repositories/mockRepository'
import { FleetService } from '../services/fleetService'

const router = express.Router()
export const fleetService = new FleetService(new MockFleetRepository())

// GET /api/fleets
router.get('/', async (req, res) => {
  const fleets = await fleetService.getAllFleets()
  res.json(fleets)
})

// GET /api/fleets/:id
router.get('/:id', async (req, res) => {
  const fleet = await fleetService.getFleetById(req.params.id)
  if (!fleet) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  res.json(fleet)
})

// POST /api/fleets
router.post('/', async (req, res) => {
  const data = req.body as CreateFleetData
  const fleet = await fleetService.createFleet(data)
  res.status(201).json(fleet)
})

// PUT /api/fleets/:id
router.put('/:id', async (req, res) => {
  const data = req.body as Partial<CreateFleetData>
  const fleet = await fleetService.updateFleet(req.params.id, data)
  if (!fleet) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  res.json(fleet)
})

// DELETE /api/fleets/:id
router.delete('/:id', async (req, res) => {
  const success = await fleetService.deleteFleet(req.params.id)
  if (!success) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  res.status(204).send()
})

export default router
