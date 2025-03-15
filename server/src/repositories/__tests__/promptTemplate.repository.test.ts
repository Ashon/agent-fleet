import { PromptTemplate } from '@agentfleet/types'
import { RepositoryDriver } from '../../drivers/repositoryDriver'
import { PromptTemplateRepository } from '../promptTemplate.repository'

describe('PromptTemplateRepository', () => {
  let mockDriver: jest.Mocked<RepositoryDriver>
  let repository: PromptTemplateRepository

  const mockTemplate: PromptTemplate = {
    id: 'test-template-1',
    name: '테스트 템플릿',
    description: '테스트 설명',
    content: '안녕하세요, {{name}}님! {{message}}',
    variables: ['name', 'message'],
    createdAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
    updatedAt: new Date('2024-03-15T09:00:00.000Z').toISOString(),
  }

  beforeEach(() => {
    mockDriver = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      exists: jest.fn(),
    }
    repository = new PromptTemplateRepository(mockDriver)
  })

  describe('findAll', () => {
    it('모든 프롬프트 템플릿을 조회해야 함', async () => {
      const mockTemplates = [
        mockTemplate,
        {
          ...mockTemplate,
          id: 'test-template-2',
          name: '테스트 템플릿 2',
        },
      ]
      mockDriver.findAll.mockResolvedValue(mockTemplates)

      const result = await repository.findAll()
      expect(result).toEqual(mockTemplates)
      expect(mockDriver.findAll).toHaveBeenCalledWith('prompt-templates')
    })
  })

  describe('findById', () => {
    it('ID로 프롬프트 템플릿을 조회해야 함', async () => {
      mockDriver.findById.mockResolvedValue(mockTemplate)

      const result = await repository.findById(mockTemplate.id)
      expect(result).toEqual(mockTemplate)
      expect(mockDriver.findById).toHaveBeenCalledWith(
        'prompt-templates',
        mockTemplate.id,
      )
    })

    it('존재하지 않는 ID로 조회 시 null을 반환해야 함', async () => {
      mockDriver.findById.mockResolvedValue(null)

      const result = await repository.findById('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('create', () => {
    it('새로운 프롬프트 템플릿을 생성해야 함', async () => {
      const createDto = {
        name: '새 템플릿',
        description: '새 설명',
        content: '{{greeting}}, {{name}}!',
        variables: ['greeting', 'name'],
      }

      const expectedTemplate = {
        ...createDto,
        id: expect.any(String),
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      }

      mockDriver.save.mockImplementation((_, template) =>
        Promise.resolve(template),
      )

      const result = await repository.create(createDto)
      expect(result).toMatchObject(expectedTemplate)
      expect(mockDriver.save).toHaveBeenCalledWith(
        'prompt-templates',
        expectedTemplate,
      )
    })
  })

  describe('update', () => {
    it('기존 프롬프트 템플릿을 수정해야 함', async () => {
      const updateDto = {
        name: '수정된 템플릿',
        content: '{{greeting}}, {{name}}님!',
        variables: ['greeting', 'name'],
      }

      mockDriver.findById.mockResolvedValue(mockTemplate)
      mockDriver.save.mockImplementation((_, template) =>
        Promise.resolve(template),
      )

      const result = await repository.update(mockTemplate.id, updateDto)
      expect(result).toMatchObject({
        ...mockTemplate,
        ...updateDto,
        updatedAt: expect.any(Date),
      })
      expect(mockDriver.save).toHaveBeenCalled()
    })

    it('존재하지 않는 템플릿 수정 시 에러를 발생시켜야 함', async () => {
      await expect(
        repository.update('non-existent-id', { name: '수정된 이름' }),
      ).rejects.toThrow('prompt templates with id non-existent-id not found')
    })
  })

  describe('delete', () => {
    it('프롬프트 템플릿을 삭제해야 함', async () => {
      mockDriver.delete.mockResolvedValue(Promise.resolve())

      await expect(repository.delete(mockTemplate.id)).rejects.toThrow(
        'prompt templates with id test-template-1 not found',
      )
    })
  })
})
