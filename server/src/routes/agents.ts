import { Router } from 'express'
import { MockRepositoryDriver } from '../drivers/mockRepositoryDriver'
import { asyncHandler } from '../middleware/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import { AgentRepository } from '../repositories/agentRepository'
import { AgentService } from '../services/agent'

const router = Router()
export const agentService = new AgentService(
  new AgentRepository(new MockRepositoryDriver()),
)

// GET /api/agents
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const agents = await agentService.getAllAgents()
    res.json(agents)
  }),
)

// GET /api/agents/:id
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const agent = await agentService.getAgentById(id)

    if (!agent) {
      throw new ApiError(404, 'Agent not found')
    }

    res.json(agent)
  }),
)

// POST /api/agents
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const agent = req.body

    if (!agent.name || !agent.description) {
      throw new ApiError(400, 'Name and description are required fields')
    }

    const newAgent = await agentService.createAgent(agent)
    res.status(201).json(newAgent)
  }),
)

// PUT /api/agents/:id
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const agent = req.body

    if (!agent.name || !agent.description) {
      throw new ApiError(400, 'Name and description are required fields')
    }

    const updatedAgent = await agentService.updateAgent(id, agent)
    if (!updatedAgent) {
      throw new ApiError(404, 'Agent not found')
    }

    res.json(updatedAgent)
  }),
)

// DELETE /api/agents/:id
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const deleted = await agentService.deleteAgent(id)

    if (!deleted) {
      throw new ApiError(404, 'Agent not found')
    }

    res.status(204).send()
  }),
)

// PATCH /api/agents/:id/status
router.patch(
  '/:id/status',
  asyncHandler(async (req, res) => {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['active', 'inactive'].includes(status)) {
      throw new ApiError(
        400,
        'Valid status value (active/inactive) is required',
      )
    }

    const updatedAgent = await agentService.updateAgentStatus(id, status)
    if (!updatedAgent) {
      throw new ApiError(404, 'Agent not found')
    }

    res.json(updatedAgent)
  }),
)

export default router
