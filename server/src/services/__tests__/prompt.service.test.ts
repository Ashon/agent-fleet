import { PromptTemplate } from '@agentfleet/types'
import { RepositoryDriver } from '../../drivers/repositoryDriver'
import { PromptTemplateRepository } from '../../repositories/promptTemplateRepository'
import { PromptService } from '../prompt.service'

jest.mock('../../repositories/promptTemplateRepository')

describe('PromptService', () => {
  let mockRepository: jest.Mocked<PromptTemplateRepository>
  let service: PromptService

  const mockTemplate: PromptTemplate = {
    id: 'test-template-1',
    name: '테스트 템플릿',
    description: '테스트 설명',
    content: '안녕하세요, {{name}}님! {{message}}',
    variables: ['name', 'message'],
    createdAt: new Date('2024-03-15T09:00:00.000Z'),
    updatedAt: new Date('2024-03-15T09:00:00.000Z'),
  }

  beforeEach(() => {
    const MockedPromptTemplateRepository =
      PromptTemplateRepository as jest.MockedClass<
        typeof PromptTemplateRepository
      >
    mockRepository = new MockedPromptTemplateRepository(
      {} as RepositoryDriver,
    ) as jest.Mocked<PromptTemplateRepository>

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
    it('유효한 변수를 가진 템플릿을 생성해야 함', async () => {
      const createDto = {
        name: '새 템플릿',
        description: '새 설명',
        content: '{{greeting}}, {{name}}!',
        variables: ['greeting', 'name'],
      }

      mockRepository.create.mockResolvedValue({
        ...createDto,
        id: 'new-id',
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      const result = await service.createTemplate(createDto)
      expect(result).toBeDefined()
      expect(mockRepository.create).toHaveBeenCalledWith(createDto)
    })

    it('선언되지 않은 변수가 있는 경우 에러를 발생시켜야 함', async () => {
      const invalidDto = {
        name: '잘못된 템플릿',
        content: '{{greeting}}, {{name}}!',
        variables: ['name'], // greeting 변수가 누락됨
      }

      await expect(service.createTemplate(invalidDto)).rejects.toThrow(
        'Template uses undeclared variables: greeting',
      )
      expect(mockRepository.create).not.toHaveBeenCalled()
    })

    it('사용되지 않은 변수가 있는 경우 에러를 발생시켜야 함', async () => {
      const invalidDto = {
        name: '잘못된 템플릿',
        content: '{{name}}님 안녕하세요!',
        variables: ['name', 'unused'], // unused 변수는 사용되지 않음
      }

      await expect(service.createTemplate(invalidDto)).rejects.toThrow(
        'Template declares unused variables: unused',
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
  })

  describe('updateTemplate', () => {
    it('유효한 변수로 템플릿을 수정해야 함', async () => {
      const updateDto = {
        content: '{{greeting}}님, 환영합니다!',
        variables: ['greeting'],
      }

      mockRepository.update.mockResolvedValue({
        ...mockTemplate,
        ...updateDto,
        updatedAt: new Date(),
      })

      const result = await service.updateTemplate(mockTemplate.id, updateDto)
      expect(result).toBeDefined()
      expect(mockRepository.update).toHaveBeenCalledWith(
        mockTemplate.id,
        updateDto,
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
