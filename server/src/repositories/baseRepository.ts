import { Entity, RepositoryDriver } from '../drivers/repositoryDriver'

export interface BaseEntity extends Entity {
  createdAt: Date | string
  updatedAt: Date | string
}

export abstract class BaseRepository<T extends BaseEntity> {
  constructor(
    protected readonly driver: RepositoryDriver,
    protected readonly entityName: string,
  ) {}

  async findAll(): Promise<T[]> {
    return this.driver.findAll<T>(this.entityName)
  }

  async exists(id: string): Promise<boolean> {
    const existing = await this.driver.exists(this.entityName, id)
    return existing !== null
  }

  async findById(id: string): Promise<T | null> {
    return this.driver.findById<T>(this.entityName, id)
  }

  async save(entity: T): Promise<T> {
    return this.driver.save<T>(this.entityName, entity)
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(
        `${this.entityName.replace(/-/g, ' ')} with id ${id} not found`,
      )
    }
    await this.driver.delete(this.entityName, id)
  }

  async clear(): Promise<void> {
    await this.driver.clear(this.entityName)
  }

  async create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date()
    const newEntity = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: now,
      updatedAt: now,
    } as T
    return this.save(newEntity)
  }

  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>,
  ): Promise<T> {
    const existing = await this.findById(id)
    if (!existing) {
      throw new Error(
        `${this.entityName.replace(/-/g, ' ')} with id ${id} not found`,
      )
    }

    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    } as T

    return this.save(updated)
  }
}
