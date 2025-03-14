import { Pipeline } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './baseRepository'

export class PipelineRepository extends BaseRepository<Pipeline> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'pipelines')
  }
}
