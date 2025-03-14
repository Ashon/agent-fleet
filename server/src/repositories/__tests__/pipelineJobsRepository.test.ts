import { PipelineExecutionRecord } from '@agentfleet/types'
import { RepositoryDriver } from '../../drivers/repositoryDriver'
import { PipelineJobsRepository } from '../pipelineJobsRepository'

describe('PipelineJobsRepository', () => {
  let mockDriver: jest.Mocked<RepositoryDriver>
  let repository: PipelineJobsRepository

  const mockJob: PipelineExecutionRecord = {
    id: 'test-job-1',
    pipelineId: 'test-pipeline-1',
    pipelineName: '테스트 파이프라인',
    input: '테스트 입력',
    status: 'completed',
    startTime: new Date('2024-03-15T09:00:00.000Z'),
    endTime: new Date('2024-03-15T09:02:00.000Z'),
    nodeResults: [
      {
        nodeId: 'node-1',
        nodeName: '테스트 노드',
        nodeType: 'input',
        output: '테스트 출력',
        startTime: new Date('2024-03-15T09:00:00.000Z'),
        endTime: new Date('2024-03-15T09:02:00.000Z'),
        status: 'success',
      },
    ],
    finalOutput: '테스트 출력',
  }

  beforeEach(() => {
    mockDriver = {
      findAll: jest.fn(),
      findById: jest.fn(),
      save: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
    }
    repository = new PipelineJobsRepository(mockDriver)
  })

  describe('findAll', () => {
    it('모든 파이프라인 작업을 조회해야 함', async () => {
      const mockJobs = [
        mockJob,
        {
          ...mockJob,
          id: 'test-job-2',
          pipelineId: 'test-pipeline-2',
        },
      ]
      mockDriver.findAll.mockResolvedValue(mockJobs)

      const result = await repository.findAll()
      expect(result).toEqual(mockJobs)
      expect(mockDriver.findAll).toHaveBeenCalledWith('pipeline-jobs')
    })
  })

  describe('findById', () => {
    it('ID로 파이프라인 작업을 조회해야 함', async () => {
      mockDriver.findById.mockResolvedValue(mockJob)

      const result = await repository.findById(mockJob.id)
      expect(result).toEqual(mockJob)
      expect(mockDriver.findById).toHaveBeenCalledWith(
        'pipeline-jobs',
        mockJob.id,
      )
    })

    it('존재하지 않는 ID로 조회 시 null을 반환해야 함', async () => {
      mockDriver.findById.mockResolvedValue(null)

      const result = await repository.findById('non-existent-id')
      expect(result).toBeNull()
    })
  })

  describe('save', () => {
    it('파이프라인 작업을 저장해야 함', async () => {
      mockDriver.save.mockResolvedValue(mockJob)

      const result = await repository.save(mockJob)
      expect(result).toEqual(mockJob)
      expect(mockDriver.save).toHaveBeenCalledWith('pipeline-jobs', mockJob)
    })
  })

  describe('findByPipelineId', () => {
    it('파이프라인 ID로 작업을 조회해야 함', async () => {
      const mockJobs = [
        mockJob,
        {
          ...mockJob,
          id: 'test-job-2',
          pipelineId: 'test-pipeline-1',
        },
      ]
      mockDriver.findAll.mockResolvedValue(mockJobs)

      const result = await repository.findByPipelineId('test-pipeline-1')
      expect(result).toEqual(mockJobs)
      expect(mockDriver.findAll).toHaveBeenCalledWith('pipeline-jobs')
    })

    it('존재하지 않는 파이프라인 ID로 조회 시 빈 배열을 반환해야 함', async () => {
      mockDriver.findAll.mockResolvedValue([])

      const result = await repository.findByPipelineId('non-existent-pipeline')
      expect(result).toEqual([])
    })
  })

  describe('findById', () => {
    it('작업 ID로 파이프라인 작업을 조회해야 함', async () => {
      mockDriver.findById.mockResolvedValue(mockJob)

      const result = await repository.findById(mockJob.id)
      expect(result).toEqual(mockJob)
      expect(mockDriver.findById).toHaveBeenCalledWith(
        'pipeline-jobs',
        mockJob.id,
      )
    })
  })

  describe('save', () => {
    it('파이프라인 작업을 저장하고 변환된 결과를 반환해야 함', async () => {
      mockDriver.save.mockResolvedValue(mockJob)

      const result = await repository.save(mockJob)
      expect(result).toEqual(mockJob)
      expect(mockDriver.save).toHaveBeenCalledWith('pipeline-jobs', mockJob)
    })
  })
})
