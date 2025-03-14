import { PipelineExecutionRecord } from '@agentfleet/types'
import { Entity, RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './baseRepository'

type PipelineJobEntity = PipelineExecutionRecord & Entity

export class PipelineJobsRepository extends BaseRepository<PipelineJobEntity> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'pipeline-jobs')
  }

  override async findAll(): Promise<PipelineJobEntity[]> {
    const entities = await super.findAll()
    return entities
  }

  override async findById(id: string): Promise<PipelineJobEntity | null> {
    const entity = await super.findById(id)
    return entity
  }

  override async save(
    record: PipelineExecutionRecord,
  ): Promise<PipelineJobEntity> {
    return super.save(record)
  }

  async findByPipelineId(
    pipelineId: string,
  ): Promise<PipelineExecutionRecord[]> {
    const entities = await this.findAll()
    return entities.filter((entity) => entity.pipelineId === pipelineId)
  }

  async findJobById(id: string): Promise<PipelineExecutionRecord | null> {
    const entity = await this.findById(id)
    return entity
  }

  async saveJob(
    record: PipelineExecutionRecord,
  ): Promise<PipelineExecutionRecord> {
    const savedEntity = await this.save(record)

    return savedEntity
  }
}
