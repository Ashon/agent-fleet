import { Agent } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './baseRepository'

export class AgentRepository extends BaseRepository<Agent> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'agents')
  }
}
