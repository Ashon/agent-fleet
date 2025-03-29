import { Prompt } from '@agentfleet/types'
import { RepositoryDriver } from '../../drivers/repositoryDriver'
import { PromptRepository } from '../../repositories/prompt.repository'
import { PromptService } from '../prompt.service'

jest.mock('../../repositories/prompt.repository')

describe('PromptService', () => {
  let mockRepository: jest.Mocked<PromptRepository>
  let service: PromptService

  const mockTemplate: Prompt = {
    id: 'test-template-1',
    name: '테스트 템플릿',
    description: '테스트 설명',
    content: '안녕하세요, {{name}}님! {{message}}',
    variables: ['name', 'message'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  }

  beforeEach(() => {
    const MockedPromptRepository = PromptRepository as jest.MockedClass<
      typeof PromptRepository
    >
    mockRepository = new MockedPromptRepository(
      {} as RepositoryDriver,
    ) as jest.Mocked<PromptRepository>

    // 메서드 모킹
    mockRepository.findAll = jest.fn()
    mockRepository.findById = jest.fn()
    mockRepository.create = jest.fn()
    mockRepository.update = jest.fn()
    mockRepository.delete = jest.fn()
    mockRepository.save = jest.fn()
    mockRepository.clear = jest.fn()

    service = new PromptService(mockRepository)
  })

  describe('createTemplate', () => {
    it('템플릿에서 변수를 자동으로 추출하여 저장해야 함', async () => {
      const createDto = {
        name: '새 템플릿',
        description: '새 설명',
        content: '{{greeting}}, {{name}}님!',
        variables: [], // 빈 배열로 시작
      }

      mockRepository.create.mockImplementation((dto) => {
        // 변수 추출 결과 검증
        expect(dto.variables).toContain('greeting')
        expect(dto.variables).toContain('name')
        expect(dto.variables.length).toBe(2)

        return Promise.resolve({
          ...dto,
          id: 'new-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      })

      await service.createTemplate(createDto)
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('헬퍼 함수가 있는 템플릿을 처리해야 함', async () => {
      const createDto = {
        name: '헬퍼 템플릿',
        description: '헬퍼 함수 테스트',
        content:
          '{{uppercase name}}님, {{lowercase greeting}}! {{trim message}}',
        variables: [],
      }

      mockRepository.create.mockImplementation((dto) => {
        // 변수 추출 결과 검증
        expect(dto.variables).toContain('name')
        expect(dto.variables).toContain('greeting')
        expect(dto.variables).toContain('message')
        expect(dto.variables).not.toContain('uppercase')
        expect(dto.variables).not.toContain('lowercase')
        expect(dto.variables).not.toContain('trim')
        expect(dto.variables.length).toBe(3)

        return Promise.resolve({
          ...dto,
          id: 'new-id',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      })

      await service.createTemplate(createDto)
      expect(mockRepository.create).toHaveBeenCalled()
    })

    it('잘못된 Handlebars 문법이 있는 경우 에러를 발생시켜야 함', async () => {
      const invalidDto = {
        name: '잘못된 템플릿',
        description: '문법 오류 테스트',
        content: '{{#if name}}이름: {{name}', // 닫는 if 태그 누락
        variables: [],
      }

      await expect(service.createTemplate(invalidDto)).rejects.toThrow(
        '템플릿 유효성 검사 실패',
      )
      expect(mockRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('renderPrompt', () => {
    it('모든 변수가 제공된 경우 프롬프트를 렌더링해야 함', async () => {
      mockRepository.findById.mockResolvedValue(mockTemplate)

      const variables = {
        name: '홍길동',
        message: '오늘도 좋은 하루 되세요!',
      }

      const result = await service.renderPrompt(mockTemplate.id, variables)
      expect(result).toBe('안녕하세요, 홍길동님! 오늘도 좋은 하루 되세요!')
    })

    it('헬퍼 함수가 적용된 프롬프트를 렌더링해야 함', async () => {
      const template = {
        ...mockTemplate,
        content:
          '{{uppercase name}}님, {{lowercase greeting}}! {{trim message}}',
        variables: ['name', 'greeting', 'message'],
      }
      mockRepository.findById.mockResolvedValue(template)

      const variables = {
        name: 'hong',
        greeting: 'HELLO',
        message: '  좋은 하루!  ',
      }

      const result = await service.renderPrompt(template.id, variables)
      expect(result).toBe('HONG님, hello! 좋은 하루!')
    })

    it('필수 변수가 누락된 경우 에러를 발생시켜야 함', async () => {
      mockRepository.findById.mockResolvedValue(mockTemplate)

      const variables = {
        name: '홍길동',
        // message 변수 누락
      }

      await expect(
        service.renderPrompt(mockTemplate.id, variables),
      ).rejects.toThrow('Missing required variables: message')
    })

    it('존재하지 않는 템플릿 ID로 요청 시 에러를 발생시켜야 함', async () => {
      mockRepository.findById.mockResolvedValue(null)

      await expect(service.renderPrompt('non-existent-id', {})).rejects.toThrow(
        'Template with id non-existent-id not found',
      )
    })

    it('잘못된 변수 타입이 제공된 경우에도 렌더링을 시도해야 함', async () => {
      const template = {
        ...mockTemplate,
        content: '숫자: {{number}}, 객체: {{object}}, 배열: {{array}}',
        variables: ['number', 'object', 'array'],
      }
      mockRepository.findById.mockResolvedValue(template)

      const variables = {
        number: '42',
        object: '[object Object]',
        array: '1,2,3',
      }

      const result = await service.renderPrompt(template.id, variables)
      expect(result).toBe('숫자: 42, 객체: [object Object], 배열: 1,2,3')
    })
  })

  describe('updateTemplate', () => {
    it('템플릿 내용 수정 시 변수를 자동으로 추출해야 함', async () => {
      const updateDto = {
        content: '{{greeting}}님, {{uppercase name}}!',
      }

      mockRepository.update.mockImplementation((id, dto) => {
        // 변수 추출 결과 검증
        expect(dto.variables).toBeDefined()
        const variables = dto.variables as string[]
        expect(variables).toContain('greeting')
        expect(variables).toContain('name')
        expect(variables).not.toContain('uppercase')
        expect(variables.length).toBe(2)

        return Promise.resolve({
          ...mockTemplate,
          ...dto,
          variables: variables,
          updatedAt: new Date().toISOString(),
        })
      })

      await service.updateTemplate(mockTemplate.id, updateDto)
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockTemplate.id,
        expect.objectContaining({
          content: updateDto.content,
        }),
      )
    })
  })

  describe('deleteTemplate', () => {
    it('템플릿을 삭제해야 함', async () => {
      mockRepository.delete.mockResolvedValue()

      await service.deleteTemplate(mockTemplate.id)
      expect(mockRepository.delete).toHaveBeenCalledWith(mockTemplate.id)
    })
  })
})
