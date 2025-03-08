import { Router } from 'express'
import { workflowService } from '../services/agentWorkflow'

const router = Router()

// 워크플로우 목록 조회
router.get('/', async (req, res) => {
  try {
    const { agentId } = req.query
    const workflows = await workflowService.getAllWorkflows(
      agentId ? { agentId: agentId as string } : undefined,
    )
    res.json(workflows)
  } catch (error) {
    res
      .status(500)
      .json({ message: '워크플로우 목록 조회 중 오류가 발생했습니다.' })
  }
})

// 특정 워크플로우 조회
router.get('/:id', async (req, res) => {
  try {
    const workflow = await workflowService.getWorkflowById(req.params.id)
    if (!workflow) {
      return res.status(404).json({ message: '워크플로우를 찾을 수 없습니다.' })
    }
    res.json(workflow)
  } catch (error) {
    res.status(500).json({ message: '워크플로우 조회 중 오류가 발생했습니다.' })
  }
})

// 새로운 워크플로우 생성
router.post('/', async (req, res) => {
  try {
    const newWorkflow = await workflowService.createWorkflow(req.body)
    res.status(201).json(newWorkflow)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message })
    } else {
      res
        .status(500)
        .json({ message: '워크플로우 생성 중 오류가 발생했습니다.' })
    }
  }
})

// 워크플로우 수정
router.put('/:id', async (req, res) => {
  try {
    const updatedWorkflow = await workflowService.updateWorkflow(
      req.params.id,
      req.body,
    )
    if (!updatedWorkflow) {
      return res.status(404).json({ message: '워크플로우를 찾을 수 없습니다.' })
    }
    res.json(updatedWorkflow)
  } catch (error) {
    res.status(500).json({ message: '워크플로우 수정 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 삭제
router.delete('/:id', async (req, res) => {
  try {
    const deleted = await workflowService.deleteWorkflow(req.params.id)
    if (!deleted) {
      return res.status(404).json({ message: '워크플로우를 찾을 수 없습니다.' })
    }
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: '워크플로우 삭제 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 실행
router.post('/:id/execute', async (req, res) => {
  try {
    // 워크플로우 유효성 검사
    const validation = await workflowService.validateWorkflow(req.params.id)
    if (!validation.isValid) {
      return res.status(400).json({
        message: validation.message || '유효하지 않은 워크플로우입니다.',
      })
    }

    const workflow = await workflowService.getWorkflowById(req.params.id)
    if (!workflow) {
      return res.status(404).json({ message: '워크플로우를 찾을 수 없습니다.' })
    }

    // TODO: 워크플로우 실행 로직 구현
    res.json({
      message: '워크플로우 실행이 시작되었습니다.',
      workflowId: workflow.id,
    })
  } catch (error) {
    res.status(500).json({ message: '워크플로우 실행 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 노드 업데이트
router.put('/:id/nodes', async (req, res) => {
  try {
    const updatedWorkflow = await workflowService.updateWorkflowNodes(
      req.params.id,
      req.body,
    )
    if (!updatedWorkflow) {
      return res.status(404).json({ message: '워크플로우를 찾을 수 없습니다.' })
    }
    res.json(updatedWorkflow)
  } catch (error) {
    res
      .status(500)
      .json({ message: '워크플로우 노드 업데이트 중 오류가 발생했습니다.' })
  }
})

// 워크플로우 엣지 업데이트
router.put('/:id/edges', async (req, res) => {
  try {
    const updatedWorkflow = await workflowService.updateWorkflowEdges(
      req.params.id,
      req.body,
    )
    if (!updatedWorkflow) {
      return res.status(404).json({ message: '워크플로우를 찾을 수 없습니다.' })
    }
    res.json(updatedWorkflow)
  } catch (error) {
    res
      .status(500)
      .json({ message: '워크플로우 엣지 업데이트 중 오류가 발생했습니다.' })
  }
})

export default router
