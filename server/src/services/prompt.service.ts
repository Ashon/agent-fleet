import {
  CreatePromptTemplateDto,
  PromptTemplate,
  UpdatePromptTemplateDto,
} from '@agentfleet/types'
import { PromptTemplateRepository } from '../repositories/promptTemplateRepository'

export class PromptService {
  constructor(
    private readonly promptTemplateRepository: PromptTemplateRepository,
  ) {}

  async createTemplate(dto: CreatePromptTemplateDto): Promise<PromptTemplate> {
    // 변수 유효성 검사
    this.validateVariables(dto.content, dto.variables)
    return this.promptTemplateRepository.create(dto)
  }

  async getTemplate(id: string): Promise<PromptTemplate> {
    const template = await this.promptTemplateRepository.findById(id)
    if (!template) {
      throw new Error(`Template with id ${id} not found`)
    }
    return template
  }

  async getAllTemplates(): Promise<PromptTemplate[]> {
    return this.promptTemplateRepository.findAll()
  }

  async updateTemplate(
    id: string,
    dto: UpdatePromptTemplateDto,
  ): Promise<PromptTemplate> {
    if (dto.content && dto.variables) {
      this.validateVariables(dto.content, dto.variables)
    }
    return this.promptTemplateRepository.update(id, dto)
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.promptTemplateRepository.delete(id)
  }

  async renderPrompt(
    templateId: string,
    variables: Record<string, string>,
  ): Promise<string> {
    const template = await this.getTemplate(templateId)

    // 필요한 모든 변수가 제공되었는지 확인
    const missingVariables = template.variables.filter(
      (v: string) => !(v in variables),
    )
    if (missingVariables.length > 0) {
      throw new Error(
        `Missing required variables: ${missingVariables.join(', ')}`,
      )
    }

    // 프롬프트 렌더링
    let rendered = template.content
    for (const [key, value] of Object.entries(variables)) {
      rendered = rendered.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }

    return rendered
  }

  private validateVariables(content: string, variables: string[]): void {
    // 템플릿에서 사용된 변수 추출
    const usedVariables = Array.from(content.matchAll(/{{(\w+)}}/g)).map(
      (m) => m[1],
    )

    // 선언되지 않은 변수 확인
    const undeclaredVariables = usedVariables.filter(
      (v: string) => !variables.includes(v),
    )
    if (undeclaredVariables.length > 0) {
      throw new Error(
        `Template uses undeclared variables: ${undeclaredVariables.join(', ')}`,
      )
    }

    // 사용되지 않은 변수 확인
    const unusedVariables = variables.filter(
      (v: string) => !usedVariables.includes(v),
    )
    if (unusedVariables.length > 0) {
      throw new Error(
        `Template declares unused variables: ${unusedVariables.join(', ')}`,
      )
    }
  }
}
