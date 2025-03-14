import { Fleet } from '@agentfleet/types'
import { S3RepositoryDriver } from '../drivers/s3RepositoryDriver'
import { BaseRepository } from './baseRepository'

export class FleetRepository extends BaseRepository<Fleet> {
  constructor(driver: S3RepositoryDriver) {
    super(driver, 'fleets')
  }
}
