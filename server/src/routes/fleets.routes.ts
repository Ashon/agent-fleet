import { CreateFleetData } from '@agentfleet/types'
import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import { FleetService } from '../services/fleet.service'

export const createFleetsRouter = (service: FleetService) => {
  const router = Router()

  // GET /api/fleets - Retrieve all fleets
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const fleets = await service.getAllFleets()
      res.json(fleets)
    }),
  )

  // GET /api/fleets/:id - Retrieve a specific fleet by ID
  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const fleet = await service.getFleetById(req.params.id)
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
      const fleet = await service.createFleet(data)
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
      const fleet = await service.updateFleet(req.params.id, data)
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
      const success = await service.deleteFleet(req.params.id)
      if (!success) {
        throw new ApiError(404, 'Fleet not found')
      }
      res.status(204).send()
    }),
  )

  return router
}
