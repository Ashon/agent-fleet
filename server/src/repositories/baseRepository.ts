import { Entity, RepositoryDriver } from '../drivers/repositoryDriver'

export abstract class BaseRepository<T extends Entity> {
  constructor(
    protected readonly driver: RepositoryDriver,
    protected readonly entityName: string,
  ) {}

  async findAll(): Promise<T[]> {
    return this.driver.findAll<T>(this.entityName)
  }

  async findById(id: string): Promise<T | null> {
    return this.driver.findById<T>(this.entityName, id)
  }

  async save(entity: T): Promise<T> {
    return this.driver.save<T>(this.entityName, entity)
  }

  async delete(id: string): Promise<void> {
    await this.driver.delete(this.entityName, id)
  }
}
