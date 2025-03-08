import { Router } from 'express'
import { AgentService } from '../services/agent'

const router = Router()
const agentService = new AgentService()

// 에이전트 목록 조회
router.get('/', async (req, res) => {
  try {
    const agents = await agentService.getAllAgents()
    res.json(agents)
  } catch (error) {
    res
      .status(500)
      .json({ message: '에이전트 목록 조회 중 오류가 발생했습니다.' })
  }
})

// 특정 에이전트 조회
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const agent = await agentService.getAgentById(id)

    if (!agent) {
      return res.status(404).json({ message: '에이전트를 찾을 수 없습니다.' })
    }

    res.json(agent)
  } catch (error) {
    res.status(500).json({ message: '에이전트 조회 중 오류가 발생했습니다.' })
  }
})

// 새로운 에이전트 생성
router.post('/', async (req, res) => {
  try {
    const agent = req.body

    // 필수 필드 검증
    if (!agent.name || !agent.description) {
      return res.status(400).json({
        message: '이름과 설명은 필수 필드입니다.',
      })
    }

    const newAgent = await agentService.createAgent(agent)
    res.status(201).json(newAgent)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message })
    } else {
      res.status(500).json({ message: '에이전트 생성 중 오류가 발생했습니다.' })
    }
  }
})

// 에이전트 수정
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const agent = req.body

    // 필수 필드 검증
    if (!agent.name || !agent.description) {
      return res.status(400).json({
        message: '이름과 설명은 필수 필드입니다.',
      })
    }

    const updatedAgent = await agentService.updateAgent(id, agent)
    if (!updatedAgent) {
      return res.status(404).json({ message: '에이전트를 찾을 수 없습니다.' })
    }

    res.json(updatedAgent)
  } catch (error) {
    res.status(500).json({ message: '에이전트 수정 중 오류가 발생했습니다.' })
  }
})

// 에이전트 삭제
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await agentService.deleteAgent(id)

    if (!deleted) {
      return res.status(404).json({ message: '에이전트를 찾을 수 없습니다.' })
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ message: '에이전트 삭제 중 오류가 발생했습니다.' })
  }
})

// 에이전트 상태 변경
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!status || !['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        message: '유효한 상태 값(active/inactive)을 입력해주세요.',
      })
    }

    const updatedAgent = await agentService.updateAgentStatus(id, status)
    if (!updatedAgent) {
      return res.status(404).json({ message: '에이전트를 찾을 수 없습니다.' })
    }

    res.json(updatedAgent)
  } catch (error) {
    res
      .status(500)
      .json({ message: '에이전트 상태 변경 중 오류가 발생했습니다.' })
  }
})

export default router
