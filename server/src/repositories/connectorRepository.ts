import { Connector } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './baseRepository'

export class ConnectorRepository extends BaseRepository<Connector> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'connectors')
  }
}
