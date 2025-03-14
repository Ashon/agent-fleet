import { mockPipelines } from '../mocks/agentReasoningPipeline'
import { mockAgents } from '../mocks/agents'
import { mockConnectors } from '../mocks/connectors'
import { mockFleets } from '../mocks/fleets'
import { mockPipelineJobs } from '../mocks/pipelineJobs'
import { Entity, RepositoryDriver } from './repositoryDriver'

export class MockRepositoryDriver implements RepositoryDriver {
  private data: Record<string, Entity[]>

  constructor(initialData: Record<string, Entity[]> = {}) {
    this.data = {
      agents: [...mockAgents],
      fleets: [...mockFleets],
      connectors: [...mockConnectors],
      pipelines: [...mockPipelines],
      pipelineJobs: [...mockPipelineJobs],
    }
    if (initialData) {
      this.data = { ...this.data, ...initialData }
    }
  }

  async findAll<T extends Entity>(entityName: string): Promise<T[]> {
    return (this.data[entityName] || []) as T[]
  }

  async findById<T extends Entity>(
    entityName: string,
    id: string,
  ): Promise<T | null> {
    const entity = (this.data[entityName] || []).find((e) => e.id === id)
    return (entity as T) || null
  }

  async save<T extends Entity>(entityName: string, entity: T): Promise<T> {
    if (!this.data[entityName]) {
      this.data[entityName] = []
    }

    const index = this.data[entityName].findIndex((e) => e.id === entity.id)
    if (index >= 0) {
      this.data[entityName][index] = entity
    } else {
      this.data[entityName].push(entity)
    }

    return entity
  }

  async delete(entityName: string, id: string): Promise<void> {
    if (!this.data[entityName]) return

    this.data[entityName] = this.data[entityName].filter((e) => e.id !== id)
  }

  async clear(entityName: string): Promise<void> {
    this.data[entityName] = []
  }
}
