// ISO 8601 형식의 날짜 문자열 타입
export type ISODateString = string

// 공통 타입 정의
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

export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}
