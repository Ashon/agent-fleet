import { Router } from 'express'
import { MockRepositoryDriver } from '../drivers/mockRepositoryDriver'
import { asyncHandler } from '../middleware/asyncHandler'
import { ApiError } from '../middleware/errorHandler'
import { PipelineJobsRepository } from '../repositories/pipelineJobsRepository'
import { NodeExecutorFactory } from '../services/nodeExecutors/NodeExecutorFactory'
import { PipelineExecutionService } from '../services/pipelineExecution.service'

const router = Router()

export const pipelineExecutionService = new PipelineExecutionService(
  new PipelineJobsRepository(new MockRepositoryDriver()),
  new NodeExecutorFactory(),
)

// GET /api/pipeline-jobs/jobs - Retrieve all execution records
router.get(
  '/jobs',
  asyncHandler(async (req, res) => {
    const records = await pipelineExecutionService.getAllExecutionRecords()
    res.json(records)
  }),
)

// GET /api/pipeline-jobs/jobs/:jobId - Retrieve execution record by job ID
router.get(
  '/jobs/:jobId',
  asyncHandler(async (req, res) => {
    const { jobId } = req.params
    const record = await pipelineExecutionService.getExecutionRecord(jobId)

    if (!record) {
      throw new ApiError(404, 'Execution record not found')
    }

    res.json({
      success: true,
      data: record,
    })
  }),
)

// GET /api/pipeline-jobs/pipelines/:pipelineId/jobs - Retrieve execution records by pipeline ID
router.get(
  '/pipelines/:pipelineId/jobs',
  asyncHandler(async (req, res) => {
    const { pipelineId } = req.params
    const records =
      await pipelineExecutionService.getExecutionRecordsByPipelineId(pipelineId)

    if (!records || records.length === 0) {
      throw new ApiError(404, 'No execution records found for this pipeline')
    }

    res.json(records)
  }),
)

export default router
