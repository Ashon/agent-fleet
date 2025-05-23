export interface Entity {
  id: string
  [key: string]: any
}

export interface RepositoryDriver {
  findAll<T extends Entity>(entityName: string): Promise<T[]>
  findById<T extends Entity>(entityName: string, id: string): Promise<T | null>
  save<T extends Entity>(entityName: string, entity: T): Promise<T>
  delete(entityName: string, id: string): Promise<void>
  clear(entityName: string): Promise<void>
  exists(entityName: string, id: string): Promise<boolean>
}
