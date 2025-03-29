import { CreatePromptDto, Prompt, UpdatePromptDto } from '@agentfleet/types'
import Handlebars from 'handlebars'
import { PromptRepository } from '../repositories/prompt.repository'

export class PromptService {
  private readonly helpers = new Set(['lowercase', 'uppercase', 'trim'])

  constructor(private readonly promptRepository: PromptRepository) {
    // 기본 헬퍼 함수 등록
    Handlebars.registerHelper('lowercase', (str) => str?.toLowerCase())
    Handlebars.registerHelper('uppercase', (str) => str?.toUpperCase())
    Handlebars.registerHelper('trim', (str) => str?.trim())
  }

  async createTemplate(dto: CreatePromptDto): Promise<Prompt> {
    // 템플릿 유효성 검사 및 변수 추출
    const extractedVariables = this.extractTemplateVariables(dto.content)
    dto.variables = extractedVariables
    return this.promptRepository.create(dto)
  }

  async getTemplate(id: string): Promise<Prompt> {
    const template = await this.promptRepository.findById(id)
    if (!template) {
      throw new Error(`Template with id ${id} not found`)
    }
    return template
  }

  async getAllTemplates(): Promise<Prompt[]> {
    return this.promptRepository.findAll()
  }

  async updateTemplate(id: string, dto: UpdatePromptDto): Promise<Prompt> {
    if (dto.content) {
      // 템플릿 유효성 검사 및 변수 추출
      const extractedVariables = this.extractTemplateVariables(dto.content)
      dto.variables = extractedVariables
    }
    return this.promptRepository.update(id, dto)
  }

  async deleteTemplate(id: string): Promise<void> {
    await this.promptRepository.delete(id)
  }

  async renderPrompt(
    templateId: string,
    variables: Record<string, any>,
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

    try {
      // 템플릿 컴파일 및 렌더링
      const stringifiedVariables = Object.entries(variables).reduce(
        (acc: Record<string, string>, [key, value]) => {
          acc[key] =
            value instanceof Object ? JSON.stringify(value) : value.toString()
          return acc
        },
        {},
      )
      const compiledTemplate = Handlebars.compile(template.content, {
        noEscape: true,
      })
      return compiledTemplate(stringifiedVariables)
    } catch (err) {
      const error = err as Error
      throw new Error(`템플릿 렌더링 실패: ${error.message}`)
    }
  }

  private extractTemplateVariables(content: string): string[] {
    try {
      // Handlebars AST를 사용하여 변수 추출
      const ast = Handlebars.parse(content)
      const usedVariables = new Set<string>()
      const helpers = this.helpers

      class VariableExtractor extends Handlebars.Visitor {
        MustacheStatement(node: any) {
          if (node.path.type === 'PathExpression') {
            const varName = node.path.original
            // 헬퍼 함수가 아닌 경우에만 변수로 추가
            if (!helpers.has(varName)) {
              // 헬퍼 함수의 매개변수인 경우
              if (node.params && node.params.length > 0) {
                node.params.forEach((param: any) => {
                  if (param.type === 'PathExpression') {
                    usedVariables.add(param.original)
                  }
                })
              } else {
                // 일반 변수인 경우
                usedVariables.add(varName)
              }
            } else if (node.params && node.params.length > 0) {
              // 헬퍼 함수의 매개변수 추출
              node.params.forEach((param: any) => {
                if (param.type === 'PathExpression') {
                  usedVariables.add(param.original)
                }
              })
            }
          }
        }
      }

      new VariableExtractor().accept(ast)
      return Array.from(usedVariables)
    } catch (err) {
      const error = err as Error
      throw new Error(`템플릿 유효성 검사 실패: ${error.message}`)
    }
  }
}
