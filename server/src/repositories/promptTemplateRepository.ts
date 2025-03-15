import { PromptTemplate } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './baseRepository'

export class PromptTemplateRepository extends BaseRepository<PromptTemplate> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'prompt-templates')
  }
}
