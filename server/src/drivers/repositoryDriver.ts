export interface Entity {
  id: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any
}

export interface RepositoryDriver {
  findAll<T extends Entity>(entityName: string): Promise<T[]>
  findById<T extends Entity>(entityName: string, id: string): Promise<T | null>
  save<T extends Entity>(entityName: string, entity: T): Promise<T>
  delete(entityName: string, id: string): Promise<void>
  clear(entityName: string): Promise<void>
}
