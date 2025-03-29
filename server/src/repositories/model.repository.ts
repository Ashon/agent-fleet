import { ModelConfig } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './base.repository'

export class ModelRepository extends BaseRepository<ModelConfig> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'models')
  }
}
