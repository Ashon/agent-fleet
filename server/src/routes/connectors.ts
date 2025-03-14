import { Router } from 'express'
import { MockConnectorRepository } from '../repositories/mockRepository'
import { ConnectorService } from '../services/connectorService'

const router = Router()
const connectorService = new ConnectorService(new MockConnectorRepository())

// GET /api/connectors
router.get('/', async (req, res) => {
  const connectors = await connectorService.getAllConnectors()
  res.json(connectors)
})

// GET /api/connectors/:id
router.get('/:id', async (req, res) => {
  const { id } = req.params
  const connector = await connectorService.getConnectorById(id)
  if (!connector) {
    return res.status(404).json({ error: 'Connector not found' })
  }

  res.json(connector)
})

// POST /api/connectors
router.post('/', async (req, res) => {
  try {
    const connector = await connectorService.createConnector(req.body)
    res.status(201).json(connector)
  } catch (error) {
    res.status(400).json({ error: (error as Error).message })
  }
})

// PUT /api/connectors/:id
router.put('/:id', async (req, res) => {
  const { id } = req.params
  const updatedConnector = await connectorService.updateConnector(id, req.body)
  if (!updatedConnector) {
    return res.status(404).json({ error: 'Connector not found' })
  }

  res.json(updatedConnector)
})

// DELETE /api/connectors/:id
router.delete('/:id', async (req, res) => {
  const { id } = req.params
  const success = await connectorService.deleteConnector(id)
  if (!success) {
    return res.status(404).json({ error: 'Connector not found' })
  }

  res.status(204).send()
})

// POST /api/connectors/:id/test
router.post('/:id/test', async (req, res) => {
  const { id } = req.params
  const result = await connectorService.testConnector(id)
  if (!result.success) {
    return res.status(400).json(result)
  }

  res.json(result)
})

export default router
