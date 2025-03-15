import { PipelineExecutionRecord } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseEntity, BaseRepository } from './baseRepository'

type PipelineJobEntity = PipelineExecutionRecord & BaseEntity

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
