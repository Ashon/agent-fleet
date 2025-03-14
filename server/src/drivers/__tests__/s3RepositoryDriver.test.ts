import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from '@aws-sdk/client-s3'
import { sdkStreamMixin } from '@smithy/util-stream'
import { mockClient } from 'aws-sdk-client-mock'
import { Readable } from 'stream'
import { S3RepositoryDriver } from '../s3RepositoryDriver'

// S3 클라이언트 모킹
const s3Mock = mockClient(S3Client)

// 테스트용 스트림 생성 헬퍼 함수
function createMockStream(content: string) {
  const stream = new Readable()
  stream.push(content)
  stream.push(null)
  return sdkStreamMixin(stream)
}

describe('S3RepositoryDriver', () => {
  let s3RepositoryDriver: S3RepositoryDriver
  const TEST_BUCKET = 'test-bucket'

  // 테스트용 샘플 데이터
  const testEntity = {
    id: 'test-1',
    name: 'Test Entity',
    status: 'active',
  }

  beforeEach(() => {
    // 각 테스트 전에 모든 모킹을 초기화
    s3Mock.reset()
    s3RepositoryDriver = new S3RepositoryDriver(new S3Client({}), TEST_BUCKET)
  })

  describe('preflight', () => {
    it('should successfully check bucket accessibility', async () => {
      s3Mock.resolves({
        Contents: [],
      })

      await expect(s3RepositoryDriver.preflight()).resolves.not.toThrow()
    })

    it('should throw error when bucket is not accessible', async () => {
      s3Mock.rejects(new Error('Bucket not found'))

      await expect(s3RepositoryDriver.preflight()).rejects.toThrow(
        'S3 bucket is not accessible',
      )
    })
  })

  describe('save', () => {
    it('should successfully save an entity', async () => {
      s3Mock.resolves({})

      const result = await s3RepositoryDriver.save('test-entities', testEntity)

      expect(result).toEqual(testEntity)
      // PutObjectCommand가 올바른 파라미터로 호출되었는지 확인
      expect(s3Mock.calls()[0].args[0].input).toEqual({
        Bucket: TEST_BUCKET,
        Key: 'test-entities/test-1.json',
        Body: JSON.stringify(testEntity),
        ContentType: 'application/json',
      })
    })
  })

  describe('findById', () => {
    it('should return entity when found', async () => {
      s3Mock.resolves({
        Body: createMockStream(JSON.stringify(testEntity)),
      })

      const result = await s3RepositoryDriver.findById(
        'test-entities',
        'test-1',
      )
      expect(result).toEqual(testEntity)
    })

    it('should return null when entity not found', async () => {
      s3Mock.rejects({
        name: 'NoSuchKey',
      })

      const result = await s3RepositoryDriver.findById(
        'test-entities',
        'non-existent',
      )
      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all entities', async () => {
      // ListObjectsV2Command에 대한 응답 모킹
      s3Mock.on(ListObjectsV2Command).resolves({
        Contents: [
          { Key: 'test-entities/test-1.json' },
          { Key: 'test-entities/test-2.json' },
        ],
      })

      // GetObjectCommand에 대한 응답 모킹
      s3Mock
        .on(GetObjectCommand)
        .resolvesOnce({
          Body: createMockStream(JSON.stringify(testEntity)),
        })
        .resolvesOnce({
          Body: createMockStream(
            JSON.stringify({ ...testEntity, id: 'test-2' }),
          ),
        })

      const results = await s3RepositoryDriver.findAll('test-entities')
      expect(results).toHaveLength(2)
      expect(results[0]).toEqual(testEntity)
      expect(results[1]).toEqual({ ...testEntity, id: 'test-2' })
    })

    it('should return empty array when no entities exist', async () => {
      s3Mock.resolves({
        Contents: [],
      })

      const results = await s3RepositoryDriver.findAll('test-entities')
      expect(results).toEqual([])
    })
  })

  describe('delete', () => {
    it('should successfully delete an entity', async () => {
      s3Mock.resolves({})

      await s3RepositoryDriver.delete('test-entities', 'test-1')

      // DeleteObjectCommand가 올바른 파라미터로 호출되었는지 확인
      expect(s3Mock.calls()[0].args[0].input).toEqual({
        Bucket: TEST_BUCKET,
        Key: 'test-entities/test-1.json',
      })
    })
  })
})
