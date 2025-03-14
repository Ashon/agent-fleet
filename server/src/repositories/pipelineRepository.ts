import { Pipeline } from '@agentfleet/types'
import { S3RepositoryDriver } from '../drivers/s3RepositoryDriver'
import { BaseRepository } from './baseRepository'

export class PipelineRepository extends BaseRepository<Pipeline> {
  constructor(driver: S3RepositoryDriver) {
    super(driver, 'pipelines')
  }
}
