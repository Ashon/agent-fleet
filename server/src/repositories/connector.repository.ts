import { Connector } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './base.repository'

export class ConnectorRepository extends BaseRepository<Connector> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'connectors')
  }
}
