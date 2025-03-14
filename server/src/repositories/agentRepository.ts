import { Agent } from '@agentfleet/types'
import { S3RepositoryDriver } from '../drivers/s3RepositoryDriver'
import { BaseRepository } from './baseRepository'

export class AgentRepository extends BaseRepository<Agent> {
  constructor(driver: S3RepositoryDriver) {
    super(driver, 'agents')
  }
}
