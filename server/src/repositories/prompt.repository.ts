import { Prompt } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './base.repository'

export class PromptRepository extends BaseRepository<Prompt> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'prompts')
  }
}
