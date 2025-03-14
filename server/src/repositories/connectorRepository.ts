import { Connector } from '@agentfleet/types'
import { S3RepositoryDriver } from '../drivers/s3RepositoryDriver'
import { BaseRepository } from './baseRepository'

export class ConnectorRepository extends BaseRepository<Connector> {
  constructor(driver: S3RepositoryDriver) {
    super(driver, 'connectors')
  }
}
