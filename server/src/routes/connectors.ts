import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import { ConnectorService } from '../services/connector.service'

export const createConnectorsRouter = (service: ConnectorService) => {
  const router = Router()

  // GET /api/connectors - Retrieve all connectors
  router.get(
    '/',
    asyncHandler(async (req, res) => {
      const connectors = await service.getAllConnectors()
      res.json(connectors)
    }),
  )

  // GET /api/connectors/:id - Retrieve a specific connector by ID
  router.get(
    '/:id',
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const connector = await service.getConnectorById(id)
      if (!connector) {
        throw new ApiError(404, 'Connector not found')
      }
      res.json(connector)
    }),
  )

  // POST /api/connectors - Create a new connector
  router.post(
    '/',
    asyncHandler(async (req, res) => {
      if (!req.body.name || !req.body.type) {
        throw new ApiError(400, 'Connector name and type are required')
      }
      const connector = await service.createConnector(req.body)
      res.status(201).json(connector)
    }),
  )

  // PUT /api/connectors/:id - Update an existing connector
  router.put(
    '/:id',
    asyncHandler(async (req, res) => {
      const { id } = req.params
      if (Object.keys(req.body).length === 0) {
        throw new ApiError(400, 'No update data provided')
      }
      const updatedConnector = await service.updateConnector(id, req.body)
      if (!updatedConnector) {
        throw new ApiError(404, 'Connector not found')
      }
      res.json(updatedConnector)
    }),
  )

  // DELETE /api/connectors/:id - Delete a connector
  router.delete(
    '/:id',
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const success = await service.deleteConnector(id)
      if (!success) {
        throw new ApiError(404, 'Connector not found')
      }
      res.status(204).send()
    }),
  )

  // POST /api/connectors/:id/test - Test a connector connection
  router.post(
    '/:id/test',
    asyncHandler(async (req, res) => {
      const { id } = req.params
      const result = await service.testConnector(id)
      if (!result.success) {
        throw new ApiError(400, result.message || 'Connector test failed')
      }
      res.json(result)
    }),
  )

  return router
}
