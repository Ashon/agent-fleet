import { Pipeline } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './base.repository'

export class PipelineRepository extends BaseRepository<Pipeline> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'pipelines')
  }
}
