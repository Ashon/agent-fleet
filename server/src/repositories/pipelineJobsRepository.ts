import { PipelineExecutionRecord } from '@agentfleet/types'
import { Entity, RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './baseRepository'

type PipelineJobEntity = PipelineExecutionRecord & Entity

export class PipelineJobsRepository extends BaseRepository<PipelineJobEntity> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'pipeline-jobs')
  }

  async findByPipelineId(
    pipelineId: string,
  ): Promise<PipelineExecutionRecord[]> {
    const entities = await this.findAll()
    return entities.filter((entity) => entity.pipelineId === pipelineId)
  }
}
