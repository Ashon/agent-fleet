import { PromptTemplate } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './base.repository'

export class PromptTemplateRepository extends BaseRepository<PromptTemplate> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'prompt-templates')
  }
}
