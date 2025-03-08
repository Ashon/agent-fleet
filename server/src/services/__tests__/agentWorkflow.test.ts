import { Workflow, WorkflowNode } from '@agentfleet/types'
import { mockWorkflows } from '../../mocks/agentWorkflows'
import { WorkflowService } from '../agentWorkflow'

describe('WorkflowService', () => {
  let workflowService: WorkflowService
  let testWorkflow: Workflow

  beforeEach(() => {
    workflowService = new WorkflowService()
    testWorkflow = mockWorkflows[0]
  })

  describe('getAllWorkflows', () => {
    it('모든 워크플로우를 반환해야 합니다', async () => {
      const workflows = await workflowService.getAllWorkflows()
      expect(workflows).toEqual(mockWorkflows)
    })

    it('반환된 배열은 원본과 다른 참조여야 합니다', async () => {
      const workflows = await workflowService.getAllWorkflows()
      expect(workflows).not.toBe(mockWorkflows)
    })
  })

  describe('getWorkflowById', () => {
    it('존재하는 ID로 워크플로우를 찾아야 합니다', async () => {
      const workflow = await workflowService.getWorkflowById(testWorkflow.id)
      expect(workflow).toEqual(testWorkflow)
    })

    it('존재하지 않는 ID는 undefined를 반환해야 합니다', async () => {
      const workflow = await workflowService.getWorkflowById('workflow-999')
      expect(workflow).toBeUndefined()
    })

    it('빈 ID는 undefined를 반환해야 합니다', async () => {
      const workflow = await workflowService.getWorkflowById('')
      expect(workflow).toBeUndefined()
    })
  })

  describe('createWorkflow', () => {
    it('새로운 워크플로우를 생성해야 합니다', async () => {
      const newWorkflow = {
        name: 'Test Workflow',
        description: '테스트용 워크플로우',
        nodes: testWorkflow.nodes,
        edges: testWorkflow.edges,
        agentId: testWorkflow.agentId,
      }

      const createdWorkflow = await workflowService.createWorkflow(newWorkflow)
      expect(createdWorkflow).toMatchObject(newWorkflow)
      expect(createdWorkflow.id).toMatch(/^workflow-\d+$/)
    })

    it('필수 필드가 누락된 경우 에러를 발생시켜야 합니다', async () => {
      const invalidWorkflow = {
        name: 'Test Workflow',
        // description, nodes, edges가 누락됨
      }

      await expect(
        workflowService.createWorkflow(invalidWorkflow as Workflow),
      ).rejects.toThrow()
    })
  })

  describe('updateWorkflow', () => {
    it('존재하는 워크플로우를 업데이트해야 합니다', async () => {
      const updateData = {
        name: 'Updated Workflow',
        description: '업데이트된 설명',
      }

      const updatedWorkflow = await workflowService.updateWorkflow(
        testWorkflow.id,
        updateData,
      )
      expect(updatedWorkflow).toMatchObject({
        id: testWorkflow.id,
        ...updateData,
      })
    })

    it('존재하지 않는 워크플로우는 undefined를 반환해야 합니다', async () => {
      const updateData = {
        name: 'Updated Workflow',
      }

      const updatedWorkflow = await workflowService.updateWorkflow(
        'workflow-999',
        updateData,
      )
      expect(updatedWorkflow).toBeUndefined()
    })

    it('ID는 변경할 수 없어야 합니다', async () => {
      const updateData = {
        id: 'new-workflow-id',
      }

      const updatedWorkflow = await workflowService.updateWorkflow(
        testWorkflow.id,
        updateData,
      )
      expect(updatedWorkflow?.id).toBe(testWorkflow.id)
    })
  })

  describe('deleteWorkflow', () => {
    it('존재하는 워크플로우를 삭제해야 합니다', async () => {
      const result = await workflowService.deleteWorkflow(testWorkflow.id)
      expect(result).toBe(true)

      const deletedWorkflow = await workflowService.getWorkflowById(
        testWorkflow.id,
      )
      expect(deletedWorkflow).toBeUndefined()
    })

    it('존재하지 않는 워크플로우 삭제는 false를 반환해야 합니다', async () => {
      const result = await workflowService.deleteWorkflow('workflow-999')
      expect(result).toBe(false)
    })
  })

  describe('updateWorkflowNodes', () => {
    it('워크플로우 노드를 업데이트해야 합니다', async () => {
      const newNodes = [...testWorkflow.nodes]
      newNodes[0].data.name = 'Updated Start'

      const updatedWorkflow = await workflowService.updateWorkflowNodes(
        testWorkflow.id,
        newNodes,
      )
      expect(updatedWorkflow?.nodes[0].data.name).toBe('Updated Start')
    })

    it('존재하지 않는 워크플로우는 undefined를 반환해야 합니다', async () => {
      const newNodes = [...testWorkflow.nodes]
      const updatedWorkflow = await workflowService.updateWorkflowNodes(
        'workflow-999',
        newNodes,
      )
      expect(updatedWorkflow).toBeUndefined()
    })
  })

  describe('updateWorkflowEdges', () => {
    it('워크플로우 엣지를 업데이트해야 합니다', async () => {
      const newEdges = [...testWorkflow.edges]
      newEdges[0].type = 'success'

      const updatedWorkflow = await workflowService.updateWorkflowEdges(
        testWorkflow.id,
        newEdges,
      )
      expect(updatedWorkflow?.edges[0].type).toBe('success')
    })

    it('존재하지 않는 워크플로우는 undefined를 반환해야 합니다', async () => {
      const newEdges = [...testWorkflow.edges]
      const updatedWorkflow = await workflowService.updateWorkflowEdges(
        'workflow-999',
        newEdges,
      )
      expect(updatedWorkflow).toBeUndefined()
    })
  })

  describe('validateWorkflow', () => {
    it('유효한 워크플로우는 true를 반환해야 합니다', async () => {
      const result = await workflowService.validateWorkflow(testWorkflow.id)
      expect(result.isValid).toBe(true)
    })

    it('존재하지 않는 워크플로우는 false를 반환해야 합니다', async () => {
      const result = await workflowService.validateWorkflow('workflow-999')
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('워크플로우를 찾을 수 없습니다.')
    })

    it('시작 노드가 없는 워크플로우는 false를 반환해야 합니다', async () => {
      const workflow = await workflowService.getWorkflowById(testWorkflow.id)
      if (!workflow) return

      const invalidWorkflow = {
        ...workflow,
        nodes: workflow.nodes.filter(
          (node: WorkflowNode) => node.type !== 'start',
        ),
      }
      await workflowService.updateWorkflow(testWorkflow.id, invalidWorkflow)

      const result = await workflowService.validateWorkflow(testWorkflow.id)
      expect(result.isValid).toBe(false)
      expect(result.message).toBe(
        '워크플로우는 시작 노드와 종료 노드를 포함해야 합니다.',
      )
    })

    it('종료 노드가 없는 워크플로우는 false를 반환해야 합니다', async () => {
      const workflow = await workflowService.getWorkflowById(testWorkflow.id)
      if (!workflow) return

      const invalidWorkflow = {
        ...workflow,
        nodes: workflow.nodes.filter(
          (node: WorkflowNode) => node.type !== 'end',
        ),
      }
      await workflowService.updateWorkflow(testWorkflow.id, invalidWorkflow)

      const result = await workflowService.validateWorkflow(testWorkflow.id)
      expect(result.isValid).toBe(false)
      expect(result.message).toBe(
        '워크플로우는 시작 노드와 종료 노드를 포함해야 합니다.',
      )
    })

    it('유효하지 않은 엣지가 있는 워크플로우는 false를 반환해야 합니다', async () => {
      const workflow = await workflowService.getWorkflowById(testWorkflow.id)
      if (!workflow) return

      const invalidWorkflow = {
        ...workflow,
        edges: [
          ...workflow.edges,
          {
            id: 'invalid-edge',
            source: 'non-existent',
            target: 'node-1',
            type: 'default' as const,
          },
        ],
      }
      await workflowService.updateWorkflow(testWorkflow.id, invalidWorkflow)

      const result = await workflowService.validateWorkflow(testWorkflow.id)
      expect(result.isValid).toBe(false)
      expect(result.message).toBe('유효하지 않은 엣지가 있습니다.')
    })
  })
})
