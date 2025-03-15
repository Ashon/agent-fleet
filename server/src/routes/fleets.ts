import { CreateFleetData } from '@agentfleet/types'
import { Router } from 'express'
import { MockRepositoryDriver } from '../drivers/mockRepositoryDriver'
import { asyncHandler } from '../middleware/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import { FleetRepository } from '../repositories/fleetRepository'
import { FleetService } from '../services/fleet.service'

const router = Router()
export const fleetService = new FleetService(
  new FleetRepository(new MockRepositoryDriver()),
)

// GET /api/fleets - Retrieve all fleets
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const fleets = await fleetService.getAllFleets()
    res.json(fleets)
  }),
)

// GET /api/fleets/:id - Retrieve a specific fleet by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const fleet = await fleetService.getFleetById(req.params.id)
    if (!fleet) {
      throw new ApiError(404, 'Fleet not found')
    }
    res.json(fleet)
  }),
)

// POST /api/fleets - Create a new fleet
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const data = req.body as CreateFleetData
    if (!data.name) {
      throw new ApiError(400, 'Fleet name is required')
    }
    const fleet = await fleetService.createFleet(data)
    res.status(201).json(fleet)
  }),
)

// PUT /api/fleets/:id - Update an existing fleet
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const data = req.body as Partial<CreateFleetData>
    if (Object.keys(data).length === 0) {
      throw new ApiError(400, 'No update data provided')
    }
    const fleet = await fleetService.updateFleet(req.params.id, data)
    if (!fleet) {
      throw new ApiError(404, 'Fleet not found')
    }
    res.json(fleet)
  }),
)

// DELETE /api/fleets/:id - Delete a fleet
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const success = await fleetService.deleteFleet(req.params.id)
    if (!success) {
      throw new ApiError(404, 'Fleet not found')
    }
    res.status(204).send()
  }),
)

export default router
