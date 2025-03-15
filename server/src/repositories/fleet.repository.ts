import { Fleet } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './base.repository'

export class FleetRepository extends BaseRepository<Fleet> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'fleets')
  }
}
