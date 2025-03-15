export interface PromptTemplate {
  id: string
  name: string
  description?: string
  content: string
  variables: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CreatePromptTemplateDto {
  name: string
  description?: string
  content: string
  variables: string[]
}

export interface UpdatePromptTemplateDto {
  name?: string
  description?: string
  content?: string
  variables?: string[]
}

// Pipeline 노드에서 사용할 프롬프트 설정
export interface PromptNodeConfig {
  templateId: string
  variables: Record<string, string>
  contextMapping: {
    input: string[] // 입력 데이터에서 변수로 매핑할 필드
    output: string[] // 출력 데이터에서 다음 노드로 전달할 필드
  }
}
