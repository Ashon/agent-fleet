import { Workflow, WorkflowEdge, WorkflowNode } from '@agentfleet/types'
import { mockWorkflows } from '../mocks/agentWorkflows'

export class WorkflowService {
  private readonly workflows: Workflow[]

  constructor() {
    this.workflows = [...mockWorkflows]
  }

  async getAllWorkflows(filters?: { agentId?: string }): Promise<Workflow[]> {
    let filteredWorkflows = [...this.workflows]

    if (filters?.agentId) {
      filteredWorkflows = filteredWorkflows.filter(
        (workflow) => workflow.agentId === filters.agentId
      )
    }

    return filteredWorkflows
  }

  async getWorkflowById(id: string): Promise<Workflow | undefined> {
    return this.workflows.find((workflow) => workflow.id === id)
  }

  async createWorkflow(workflowData: Omit<Workflow, 'id'>): Promise<Workflow> {
    // 필수 필드 검증
    if (
      !workflowData.name ||
      !workflowData.agentId ||
      !workflowData.description ||
      !workflowData.nodes ||
      !workflowData.edges
    ) {
      throw new Error('필수 필드가 누락되었습니다.')
    }

    const newWorkflow: Workflow = {
      id: `workflow-${this.workflows.length + 1}`,
      ...workflowData,
    }
    this.workflows.push(newWorkflow)
    return newWorkflow
  }

  async updateWorkflow(
    id: string,
    workflowData: Partial<Workflow>
  ): Promise<Workflow | undefined> {
    const index = this.workflows.findIndex((workflow) => workflow.id === id)
    if (index === -1) return undefined

    this.workflows[index] = {
      ...this.workflows[index],
      ...workflowData,
      id, // ID는 변경 불가
    }
    return this.workflows[index]
  }

  async deleteWorkflow(id: string): Promise<boolean> {
    const index = this.workflows.findIndex((workflow) => workflow.id === id)
    if (index === -1) return false

    this.workflows.splice(index, 1)
    return true
  }

  async updateWorkflowNodes(
    id: string,
    nodes: Workflow['nodes']
  ): Promise<Workflow | undefined> {
    const index = this.workflows.findIndex((workflow) => workflow.id === id)
    if (index === -1) return undefined

    const workflow = this.workflows[index]
    this.workflows[index] = {
      ...workflow,
      nodes,
    }
    return this.workflows[index]
  }

  async updateWorkflowEdges(
    id: string,
    edges: Workflow['edges']
  ): Promise<Workflow | undefined> {
    const index = this.workflows.findIndex((workflow) => workflow.id === id)
    if (index === -1) return undefined

    const workflow = this.workflows[index]
    this.workflows[index] = {
      ...workflow,
      edges,
    }
    return this.workflows[index]
  }

  async validateWorkflow(
    id: string
  ): Promise<{ isValid: boolean; message?: string }> {
    const workflow = await this.getWorkflowById(id)
    if (!workflow) {
      return {
        isValid: false,
        message: '워크플로우를 찾을 수 없습니다.',
      }
    }

    // 시작 노드와 종료 노드가 있는지 확인
    const hasStartNode = workflow.nodes.some(
      (node: WorkflowNode) => node.type === 'start'
    )
    const hasEndNode = workflow.nodes.some(
      (node: WorkflowNode) => node.type === 'end'
    )

    if (!hasStartNode || !hasEndNode) {
      return {
        isValid: false,
        message: '워크플로우는 시작 노드와 종료 노드를 포함해야 합니다.',
      }
    }

    // 모든 엣지가 유효한 노드를 참조하는지 확인
    const nodeIds = new Set(workflow.nodes.map((node: WorkflowNode) => node.id))
    const hasInvalidEdge = workflow.edges.some(
      (edge: WorkflowEdge) =>
        !nodeIds.has(edge.source) || !nodeIds.has(edge.target)
    )

    if (hasInvalidEdge) {
      return {
        isValid: false,
        message: '유효하지 않은 엣지가 있습니다.',
      }
    }

    return { isValid: true }
  }
}
