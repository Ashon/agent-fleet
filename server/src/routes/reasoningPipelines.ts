import { Router } from 'express'
import { asyncHandler } from '../middleware/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import {
  MockPipelineJobsRepository,
  MockPipelineRepository,
} from '../repositories/mockRepository'
import { PipelineService } from '../services/agentReasoningPipeline'
import { PipelineExecutionService } from '../services/pipelineExecutionService'

const router = Router()
export const pipelineService = new PipelineService(new MockPipelineRepository())
export const pipelineExecutionService = new PipelineExecutionService(
  new MockPipelineJobsRepository(),
)

// GET /api/reasoning-pipelines - Retrieve all pipelines with optional agent filter
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { agentId } = req.query
    const pipelines = await pipelineService.getAllPipelines(
      agentId ? { agentId: agentId as string } : undefined,
    )
    res.json(pipelines)
  }),
)

// GET /api/reasoning-pipelines/:id - Retrieve a specific pipeline by ID
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const pipeline = await pipelineService.getPipelineById(req.params.id)
    if (!pipeline) {
      throw new ApiError(404, 'Pipeline not found')
    }
    res.json(pipeline)
  }),
)

// POST /api/reasoning-pipelines - Create a new pipeline
router.post(
  '/',
  asyncHandler(async (req, res) => {
    const newPipeline = await pipelineService.createPipeline(req.body)
    res.status(201).json(newPipeline)
  }),
)

// PUT /api/reasoning-pipelines/:id - Update an existing pipeline
router.put(
  '/:id',
  asyncHandler(async (req, res) => {
    const updatedPipeline = await pipelineService.updatePipeline(
      req.params.id,
      req.body,
    )
    if (!updatedPipeline) {
      throw new ApiError(404, 'Pipeline not found')
    }
    res.json(updatedPipeline)
  }),
)

// DELETE /api/reasoning-pipelines/:id - Delete a pipeline
router.delete(
  '/:id',
  asyncHandler(async (req, res) => {
    const deleted = await pipelineService.deletePipeline(req.params.id)
    if (!deleted) {
      throw new ApiError(404, 'Pipeline not found')
    }
    res.status(204).send()
  }),
)

// GET /api/reasoning-pipelines/test/stream - Test pipeline execution with streaming response
router.get(
  '/test/stream',
  asyncHandler(async (req, res) => {
    const { pipelineId, input } = req.query

    if (!pipelineId || !input) {
      throw new ApiError(400, 'Pipeline ID and input are required')
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    const pipeline = await pipelineService.getPipelineById(pipelineId as string)
    if (!pipeline) {
      res.write(`data: ${JSON.stringify({ error: 'Pipeline not found' })}\n\n`)
      return res.end()
    }

    try {
      await pipelineExecutionService.streamPipelineExecution(
        pipeline,
        input as string,
        res,
      )
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: 'Error occurred during pipeline execution',
        })}\n\n`,
      )
    } finally {
      res.end()
    }
  }),
)

// POST /api/reasoning-pipelines/:id/execute - Execute a pipeline
router.post(
  '/:id/execute',
  asyncHandler(async (req, res) => {
    // 워크플로우 유효성 검사
    const validation = await pipelineService.validatePipeline(req.params.id)
    if (!validation.isValid) {
      throw new ApiError(400, validation.message || 'Invalid pipeline')
    }

    const pipeline = await pipelineService.getPipelineById(req.params.id)
    if (!pipeline) {
      throw new ApiError(404, 'Pipeline not found')
    }

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    try {
      await pipelineExecutionService.streamPipelineExecution(
        pipeline,
        req.body.input || '',
        res,
      )
    } catch (error) {
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message: 'Error occurred during pipeline execution',
        })}\n\n`,
      )
    } finally {
      res.end()
    }
  }),
)

// PUT /api/reasoning-pipelines/:id/nodes - Update pipeline nodes
router.put(
  '/:id/nodes',
  asyncHandler(async (req, res) => {
    const updatedPipeline = await pipelineService.updatePipelineNodes(
      req.params.id,
      req.body,
    )
    if (!updatedPipeline) {
      throw new ApiError(404, 'Pipeline not found')
    }
    res.json(updatedPipeline)
  }),
)

// PUT /api/reasoning-pipelines/:id/edges - Update pipeline edges
router.put(
  '/:id/edges',
  asyncHandler(async (req, res) => {
    const updatedPipeline = await pipelineService.updatePipelineEdges(
      req.params.id,
      req.body,
    )
    if (!updatedPipeline) {
      throw new ApiError(404, 'Pipeline not found')
    }
    res.json(updatedPipeline)
  }),
)

// POST /api/reasoning-pipelines/test - Test pipeline configuration
router.post(
  '/test',
  asyncHandler(async (req, res) => {
    const result = await pipelineService.testPipeline(req.body)
    res.json(result)
  }),
)

export default router
