import { Router } from 'express'
import { pipelineService } from '../services/agentReasoningPipeline'

const router = Router()

// 워크플로우 목록 조회
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query
    const pipelines = await pipelineService.getAllPipelines(
      agentId ? { agentId: agentId as string } : undefined,
    )
    res.json(pipelines)
  } catch (error) {
    res
      .status(500)
      .json({ message: '파이프라인 목록 조회 중 오류가 발생했습니다.' })
  }
})

// 특정 워크플로우 조회
router.get('/:id', async (req, res) => {
  try {
    const pipeline = await pipelineService.getPipelineById(req.params.id)
    if (!pipeline) {
      return res.status(404).json({ message: '파이프라인을 찾을 수 없습니다.' })
    }
    res.json(pipeline)
  } catch (error) {
    res.status(500).json({ message: '파이프라인 조회 중 오류가 발생했습니다.' })
  }
})

// 새로운 워크플로우 생성
router.post('/', async (req, res) => {
  try {
    const newPipeline = await pipelineService.createPipeline(req.body)
    res.status(201).json(newPipeline)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message })
    } else {
      res
        .status(500)
        .json({ message: '파이프라인 생성 중 오류가 발생했습니다.' })
    }
  }
})

// 워크플로우 수정
router.put('/:id', async (req, res) => {
  try {
    const updatedPipeline = await pipelineService.updatePipeline(
      req.params.id,
      req.body,
    )
    if (!updatedPipeline) {
      return res.status(404).json({ message: '파이프라인을 찾을 수 없습니다.' })
    }
    res.json(updatedPipeline)
  } catch (error) {
    res.status(500).json({ message: '파이프라인 수정 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 삭제
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await pipelineService.deletePipeline(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: '파이프라인을 찾을 수 없습니다.' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: '파이프라인 삭제 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 실행
router.post('/:id/execute', async (req, res) => {
  try {
    // 워크플로우 유효성 검사
    const validation = await pipelineService.validatePipeline(req.params.id)
    if (!validation.isValid) {
      return res.status(400).json({
        message: validation.message || '유효하지 않은 파이프라인입니다.',
      })
    }

    const pipeline = await pipelineService.getPipelineById(req.params.id)
    if (!pipeline) {
      return res.status(404).json({ message: '파이프라인을 찾을 수 없습니다.' })
    }

    // TODO: 워크플로우 실행 로직 구현
    res.json({
      message: '파이프라인 실행이 시작되었습니다.',
      pipelineId: pipeline.id,
    })
  } catch (error) {
    res.status(500).json({ message: '파이프라인 실행 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 노드 업데이트
router.put('/:id/nodes', async (req, res) => {
  try {
    const updatedPipeline = await pipelineService.updatePipelineNodes(
      req.params.id,
      req.body,
    )
    if (!updatedPipeline) {
      return res.status(404).json({ message: '파이프라인을 찾을 수 없습니다.' })
    }
    res.json(updatedPipeline)
  } catch (error) {
    res
      .status(500)
      .json({ message: '파이프라인 노드 업데이트 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 엣지 업데이트
router.put('/:id/edges', async (req, res) => {
  try {
    const updatedPipeline = await pipelineService.updatePipelineEdges(
      req.params.id,
      req.body,
    )
    if (!updatedPipeline) {
      return res.status(404).json({ message: '파이프라인을 찾을 수 없습니다.' })
    }
    res.json(updatedPipeline)
  } catch (error) {
    res
      .status(500)
      .json({ message: '파이프라인 엣지 업데이트 중 오류가 발생했습니다.' })
  }
})

export default router
