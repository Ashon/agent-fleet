// 공통 타입 정의
export interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  updatedAt: Date
}

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// 페이지네이션 타입
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

export * from './agent'
export * from './chat'
export * from './common'
export * from './connector'
export * from './execution'
export * from './fleet'
export * from './pipeline'
