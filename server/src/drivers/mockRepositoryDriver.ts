import { mockAgents } from '../mocks/agents'
import { mockConnectors } from '../mocks/connectors'
import { mockFleets } from '../mocks/fleets'
import { mockPipelineExecutions } from '../mocks/mockPipelineExecutions'
import { mockPromptTemplates } from '../mocks/promptTemplates'
import { mockPipelines } from '../mocks/reasoningPipeline'
import { Entity, RepositoryDriver } from './repositoryDriver'

export class MockRepositoryDriver implements RepositoryDriver {
  private data: Map<string, Map<string, Entity>> = new Map()

  constructor() {
    // 초기 데이터 설정
    this.data.set(
      'fleets',
      new Map(mockFleets.map((fleet) => [fleet.id, fleet])),
    )
    this.data.set(
      'agents',
      new Map(mockAgents.map((agent) => [agent.id, agent])),
    )
    this.data.set(
      'connectors',
      new Map(mockConnectors.map((connector) => [connector.id, connector])),
    )
    this.data.set(
      'pipelines',
      new Map(mockPipelines.map((pipeline) => [pipeline.id, pipeline])),
    )
    this.data.set(
      'prompt-templates',
      new Map(mockPromptTemplates.map((template) => [template.id, template])),
    )
    this.data.set(
      'pipeline-executions',
      new Map(
        mockPipelineExecutions.map((execution) => [execution.id, execution]),
      ),
    )
  }

  async findAll<T extends Entity>(entityName: string): Promise<T[]> {
    const entityMap = this.data.get(entityName)
    if (!entityMap) {
      return []
    }
    return Array.from(entityMap.values()) as T[]
  }

  async findById<T extends Entity>(
    entityName: string,
    id: string,
  ): Promise<T | null> {
    const entityMap = this.data.get(entityName)
    if (!entityMap) {
      return null
    }
    return (entityMap.get(id) as T) || null
  }

  async exists(entityName: string, id: string): Promise<boolean> {
    const entityMap = this.data.get(entityName)
    if (!entityMap) {
      return false
    }
    return entityMap.has(id)
  }

  async save<T extends Entity>(entityName: string, entity: T): Promise<T> {
    let entityMap = this.data.get(entityName)
    if (!entityMap) {
      entityMap = new Map()
      this.data.set(entityName, entityMap)
    }
    entityMap.set(entity.id, entity)
    return entity
  }

  async delete(entityName: string, id: string): Promise<void> {
    const entityMap = this.data.get(entityName)
    if (entityMap) {
      entityMap.delete(id)
    }
  }

  async clear(entityName: string): Promise<void> {
    const entityMap = this.data.get(entityName)
    if (entityMap) {
      entityMap.clear()
    }
  }
}
