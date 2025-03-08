import { Router } from 'express'
import { mockConnectors } from '../mocks/connectors'

const router = Router()

// GET /api/connectors
router.get('/', (req, res) => {
  // TODO: 실제 데이터베이스 연동
  res.json(mockConnectors)
})

// GET /api/connectors/:id
router.get('/:id', (req, res) => {
  const { id } = req.params
  const foundConnector = mockConnectors.find((connector) => connector.id === id)
  if (!foundConnector) {
    return res.status(404).json({ error: 'Connector not found' })
  }

  // TODO: 실제 데이터베이스 연동
  res.json(mockConnectors.find((connector) => connector.id === id))
})

// POST /api/connectors
router.post('/', (req, res) => {
  const connector = req.body
  // TODO: 실제 데이터베이스 연동
  res.status(201).json({
    id: '2',
    ...connector,
    status: 'active',
    lastSync: null,
  })
})

// PUT /api/connectors/:id
router.put('/:id', (req, res) => {
  const { id } = req.params
  const foundConnector = mockConnectors.find((connector) => connector.id === id)
  if (!foundConnector) {
    return res.status(404).json({ error: 'Connector not found' })
  }

  const connector = req.body
  // TODO: 실제 데이터베이스 연동
  res.json({
    id,
    ...connector,
  })
})

// DELETE /api/connectors/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params
  const foundConnector = mockConnectors.find((connector) => connector.id === id)
  if (!foundConnector) {
    return res.status(404).json({ error: 'Connector not found' })
  }

  // TODO: 실제 데이터베이스 연동
  res.status(204).send()
})

// POST /api/connectors/:id/test
router.post('/:id/test', (req, res) => {
  const { id } = req.params
  const foundConnector = mockConnectors.find((connector) => connector.id === id)
  if (!foundConnector) {
    return res.status(404).json({ error: 'Connector not found' })
  }

  // TODO: 실제 커넥터 테스트 로직 구현
  res.json({
    success: true,
    message: '커넥터 테스트 성공',
  })
})

export default router
