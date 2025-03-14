import { Entity, RepositoryDriver } from './repositoryDriver'

export class MockRepositoryDriver implements RepositoryDriver {
  private storage: Map<string, Map<string, Entity>> = new Map()

  constructor(initialData: Record<string, Entity[]> = {}) {
    // 초기 데이터 설정
    Object.entries(initialData).forEach(([entityName, entities]) => {
      const entityMap = new Map<string, Entity>()
      entities.forEach((entity) => {
        entityMap.set(entity.id, entity)
      })
      this.storage.set(entityName, entityMap)
    })
  }

  async findAll<T extends Entity>(entityName: string): Promise<T[]> {
    const entityMap = this.storage.get(entityName) || new Map()
    return Array.from(entityMap.values()) as T[]
  }

  async findById<T extends Entity>(
    entityName: string,
    id: string,
  ): Promise<T | null> {
    const entityMap = this.storage.get(entityName)
    if (!entityMap) return null
    const entity = entityMap.get(id)
    return entity ? (entity as T) : null
  }

  async save<T extends Entity>(entityName: string, entity: T): Promise<T> {
    let entityMap = this.storage.get(entityName)
    if (!entityMap) {
      entityMap = new Map()
      this.storage.set(entityName, entityMap)
    }
    entityMap.set(entity.id, entity)
    return entity
  }

  async delete(entityName: string, id: string): Promise<void> {
    const entityMap = this.storage.get(entityName)
    if (entityMap) {
      entityMap.delete(id)
    }
  }
}
