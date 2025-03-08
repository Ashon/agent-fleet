// ISO 8601 형식의 날짜 문자열 타입
export type ISODateString = string

export interface BaseEntity {
  id: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginationParams {
  page: number
  limit: number
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}
