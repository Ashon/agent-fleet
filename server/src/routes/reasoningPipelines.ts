import { Pipeline, PipelineEdge, PipelineNode } from '@agentfleet/types'
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

// 파이프라인 실시간 테스트
router.get('/test/stream', async (req, res) => {
  const { pipelineId, input } = req.query

  if (!pipelineId || !input) {
    return res.status(400).json({ message: '필수 파라미터가 누락되었습니다.' })
  }

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  try {
    const pipeline = await pipelineService.getPipelineById(pipelineId as string)
    if (!pipeline) {
      res.write(
        `data: ${JSON.stringify({ error: '파이프라인을 찾을 수 없습니다.' })}\n\n`,
      )
      return res.end()
    }

    // 파이프라인 실행 시작
    res.write(
      `data: ${JSON.stringify({
        type: 'start',
        message: '파이프라인 실행을 시작합니다.',
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
      })}\n\n`,
    )

    try {
      // 파이프라인 실행
      await executePipeline(pipeline, input as string, res)

      // 파이프라인 실행 완료
      res.write(
        `data: ${JSON.stringify({
          type: 'complete',
          message: '파이프라인 실행이 완료되었습니다.',
          pipelineId: pipeline.id,
          finalOutput: '최종 응답이 생성되었습니다.',
        })}\n\n`,
      )
    } catch (error) {
      // 파이프라인 실행 중 오류 발생
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '파이프라인 실행 중 오류가 발생했습니다.',
          pipelineId: pipeline.id,
        })}\n\n`,
      )
    }

    res.end()
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        message: '파이프라인 실행 준비 중 오류가 발생했습니다.',
      })}\n\n`,
    )
    res.end()
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

    // SSE 헤더 설정
    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    // 실행 시작 알림
    res.write(
      `data: ${JSON.stringify({
        type: 'start',
        message: '파이프라인 실행을 시작합니다.',
        pipelineId: pipeline.id,
        pipelineName: pipeline.name,
      })}\n\n`,
    )

    try {
      // 파이프라인 실행
      await executePipeline(pipeline, req.body.input || '', res)

      // 실행 완료 알림
      res.write(
        `data: ${JSON.stringify({
          type: 'complete',
          message: '파이프라인 실행이 완료되었습니다.',
          pipelineId: pipeline.id,
          finalOutput: '최종 응답이 생성되었습니다.',
        })}\n\n`,
      )
    } catch (error) {
      // 실행 중 오류 발생
      res.write(
        `data: ${JSON.stringify({
          type: 'error',
          message:
            error instanceof Error
              ? error.message
              : '파이프라인 실행 중 오류가 발생했습니다.',
          pipelineId: pipeline.id,
        })}\n\n`,
      )
    }

    res.end()
  } catch (error) {
    res.write(
      `data: ${JSON.stringify({
        type: 'error',
        message: '파이프라인 실행 준비 중 오류가 발생했습니다.',
      })}\n\n`,
    )
    res.end()
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

// 파이프라인 테스트
router.post('/test', async (req, res) => {
  try {
    const result = await pipelineService.testPipeline(req.body)
    res.json(result)
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message })
    } else {
      res
        .status(500)
        .json({ message: '파이프라인 테스트 중 오류가 발생했습니다.' })
    }
  }
})

interface NodeExecutionState {
  node: PipelineNode
  inDegree: number
  dependencies: Set<string>
  executed: boolean
  output?: string
}

// 위상 정렬 및 실행 그래프 구성
function buildExecutionGraph(
  pipeline: Pipeline,
): Map<string, NodeExecutionState> {
  const executionGraph = new Map<string, NodeExecutionState>()

  // 초기 상태 설정
  pipeline.nodes.forEach((node) => {
    executionGraph.set(node.id, {
      node,
      inDegree: 0,
      dependencies: new Set<string>(),
      executed: false,
    })
  })

  // 의존성 관계 구성
  pipeline.edges.forEach((edge) => {
    const targetNode = executionGraph.get(edge.target)
    if (targetNode) {
      targetNode.inDegree++
      targetNode.dependencies.add(edge.source)
    }
  })

  return executionGraph
}

// 실행 가능한 노드 찾기
function findExecutableNodes(
  executionGraph: Map<string, NodeExecutionState>,
): PipelineNode[] {
  const executableNodes: PipelineNode[] = []

  executionGraph.forEach((state, nodeId) => {
    if (!state.executed && state.inDegree === 0) {
      // 병렬 실행이 가능한 노드들을 한번에 수집
      executableNodes.push(state.node)
    }
  })

  return executableNodes
}

// 노드 실행 결과 처리 및 의존성 업데이트
function updateExecutionState(
  nodeId: string,
  executionGraph: Map<string, NodeExecutionState>,
  pipeline: Pipeline,
): void {
  const state = executionGraph.get(nodeId)
  if (!state) return

  state.executed = true

  // 이 노드에 의존하는 다른 노드들의 진입 차수 감소
  pipeline.edges
    .filter((edge) => edge.source === nodeId)
    .forEach((edge) => {
      const targetState = executionGraph.get(edge.target)
      if (targetState) {
        targetState.inDegree--
      }
    })
}

// 노드 실행 함수
async function executeNode(
  node: PipelineNode,
  input: string,
  res: any,
): Promise<string> {
  // 노드 실행 시작 알림
  res.write(
    `data: ${JSON.stringify({
      type: 'node-start',
      nodeId: node.id,
      nodeName: node.data.name,
      nodeType: node.type,
    })}\n\n`,
  )

  // 노드 타입별 처리 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 5000))

  let output = ''
  switch (node.type) {
    case 'input':
      output = `입력 처리: "${input}"`
      break
    case 'plan':
      output = `계획 수립: ${node.data.description}`
      break
    case 'decision':
      output = `결정: ${node.data.description}`
      break
    case 'action':
      output = `행동 실행: ${node.data.description}`
      break
    case 'process':
      output = `데이터 처리: ${node.data.description}`
      break
    case 'aggregator':
      output = `결과 통합: ${node.data.description}`
      break
    case 'analysis':
      output = `분석 수행: ${node.data.description}`
      break
  }

  // 노드 실행 완료 알림
  res.write(
    `data: ${JSON.stringify({
      type: 'node-complete',
      nodeId: node.id,
      output,
      status: 'success',
    })}\n\n`,
  )

  await new Promise((resolve) => setTimeout(resolve, 500))
  return output
}

// 메인 파이프라인 실행 함수
export async function executePipeline(
  pipeline: Pipeline,
  input: string,
  res: any,
) {
  const executionGraph = buildExecutionGraph(pipeline)

  while (true) {
    // 실행 가능한 노드들 찾기
    const executableNodes = findExecutableNodes(executionGraph)
    if (executableNodes.length === 0) {
      // 모든 노드가 실행되었는지 확인
      const allExecuted = Array.from(executionGraph.values()).every(
        (state) => state.executed,
      )
      if (allExecuted) break

      // 사이클이 있거나 실행 불가능한 상태
      throw new Error('파이프라인 실행 오류: 실행할 수 없는 노드가 있습니다')
    }

    // 병렬 실행이 가능한 노드들 동시 실행
    await Promise.all(
      executableNodes.map(async (node) => {
        const output = await executeNode(node, input, res)
        const state = executionGraph.get(node.id)
        if (state) {
          state.output = output
        }
        updateExecutionState(node.id, executionGraph, pipeline)
      }),
    )
  }
}

export default router
