import { Router } from 'express'
import { pipelineExecutionService } from '../services/pipelineExecutionService'

const router = Router()

// 모든 실행 기록 조회
router.get('/jobs', async (req, res) => {
  try {
    const records = await pipelineExecutionService.getAllExecutionRecords()
    res.json({
      success: true,
      data: records,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '실행 기록 조회 중 오류가 발생했습니다.',
    })
  }
})

// 특정 Job ID로 실행 기록 조회
router.get('/jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const record = await pipelineExecutionService.getExecutionRecord(jobId)

    if (!record) {
      return res.status(404).json({
        success: false,
        error: '해당 실행 기록을 찾을 수 없습니다.',
      })
    }

    res.json({
      success: true,
      data: record,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '실행 기록 조회 중 오류가 발생했습니다.',
    })
  }
})

// 파이프라인 ID로 실행 기록 조회
router.get('/pipelines/:pipelineId/jobs', async (req, res) => {
  try {
    const { pipelineId } = req.params
    const records =
      await pipelineExecutionService.getExecutionRecordsByPipelineId(pipelineId)

    res.json({
      success: true,
      data: records,
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error:
        error instanceof Error
          ? error.message
          : '실행 기록 조회 중 오류가 발생했습니다.',
    })
  }
})

export default router
