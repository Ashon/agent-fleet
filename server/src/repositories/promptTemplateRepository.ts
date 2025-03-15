import { PromptTemplate } from '@agentfleet/types'
import { RepositoryDriver } from '../drivers/repositoryDriver'
import { BaseRepository } from './baseRepository'

export class PromptTemplateRepository extends BaseRepository<PromptTemplate> {
  constructor(driver: RepositoryDriver) {
    super(driver, 'prompt-templates')
  }

  async create(
    template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<PromptTemplate> {
    const now = new Date()
    const newTemplate: PromptTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    }
    return this.save(newTemplate)
  }

  async update(
    id: string,
    template: Partial<Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<PromptTemplate> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(`Template with id ${id} not found`)
    }

    const updated: PromptTemplate = {
      ...existing,
      ...template,
      updatedAt: new Date(),
    }

    return this.save(updated)
  }
}
