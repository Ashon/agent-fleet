import { Agent } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './base.repository'

export class AgentRepository extends BaseRepository<Agent> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'agents')
  }
}
