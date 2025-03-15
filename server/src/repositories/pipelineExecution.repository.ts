import { PipelineExecutionRecord } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseEntity, BaseRepository } from './base.repository'

type PipelineExecutionEntity = PipelineExecutionRecord & BaseEntity

export class PipelineExecutionsRepository extends BaseRepository<PipelineExecutionEntity> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'pipeline-executions')
  }

  async findByPipelineId(
    pipelineId: string,
  ): Promise<PipelineExecutionRecord[]> {
    const entities = await this.findAll()
    return entities.filter((entity) => entity.pipelineId === pipelineId)
  }
}
