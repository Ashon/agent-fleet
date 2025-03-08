import { CreateFleetData } from '@agentfleet/types'
import express from 'express'
import { fleetService } from '../services/fleetService'

const router = express.Router()

// GET /api/fleets
router.get('/', (req, res) => {
  const fleets = fleetService.getAllFleets()
  res.json(fleets)
})

// GET /api/fleets/:id
router.get('/:id', (req, res) => {
  const fleet = fleetService.getFleetById(req.params.id)
  if (!fleet) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  res.json(fleet)
})

// POST /api/fleets
router.post('/', (req, res) => {
  const data = req.body as CreateFleetData
  const fleet = fleetService.createFleet(data)
  res.status(201).json(fleet)
})

// PUT /api/fleets/:id
router.put('/:id', (req, res) => {
  const data = req.body as Partial<CreateFleetData>
  const fleet = fleetService.updateFleet(req.params.id, data)
  if (!fleet) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  res.json(fleet)
})

// DELETE /api/fleets/:id
router.delete('/:id', (req, res) => {
  const success = fleetService.deleteFleet(req.params.id)
  if (!success) {
    res.status(404).json({ error: 'Fleet not found' })
    return
  }
  res.status(204).send()
})

export default router
