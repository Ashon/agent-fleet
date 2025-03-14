import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { Entity, RepositoryDriver } from './repositoryDriver'

export class S3RepositoryDriver implements RepositoryDriver {
  constructor(
    private readonly s3Client: S3Client,
    private readonly bucketName: string,
  ) {}

  // S3 버킷 존재 여부 확인
  async preflight(): Promise<void> {
    try {
      await this.s3Client.send(
        new ListObjectsV2Command({
          Bucket: this.bucketName,
          MaxKeys: 1,
        }),
      )
    } catch (error) {
      console.error('S3 bucket check failed:', error)
      throw new Error('S3 bucket is not accessible')
    }
  }

  // 엔티티 저장
  async save<T extends Entity>(entityName: string, entity: T): Promise<T> {
    const key = `${entityName}/${entity.id}.json`

    await this.s3Client.send(
      new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: JSON.stringify(entity),
        ContentType: 'application/json',
      }),
    )

    return entity
  }

  // 엔티티 조회
  async findById<T extends Entity>(
    entityName: string,
    id: string,
  ): Promise<T | null> {
    const key = `${entityName}/${id}.json`

    try {
      const response = await this.s3Client.send(
        new GetObjectCommand({
          Bucket: this.bucketName,
          Key: key,
        }),
      )

      const bodyContents = await response.Body?.transformToString()
      return bodyContents ? JSON.parse(bodyContents) : null
    } catch (error: any) {
      if (error.name === 'NoSuchKey') {
        return null
      }
      throw error
    }
  }

  // 엔티티 목록 조회
  async findAll<T extends Entity>(entityName: string): Promise<T[]> {
    const response = await this.s3Client.send(
      new ListObjectsV2Command({
        Bucket: this.bucketName,
        Prefix: `${entityName}/`,
      }),
    )

    const entities: T[] = []

    if (response.Contents) {
      for (const object of response.Contents) {
        if (object.Key) {
          const getResponse = await this.s3Client.send(
            new GetObjectCommand({
              Bucket: this.bucketName,
              Key: object.Key,
            }),
          )

          const bodyContents = await getResponse.Body?.transformToString()
          if (bodyContents) {
            entities.push(JSON.parse(bodyContents))
          }
        }
      }
    }

    return entities
  }

  // 엔티티 삭제
  async delete(entityName: string, id: string): Promise<void> {
    const key = `${entityName}/${id}.json`

    await this.s3Client.send(
      new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      }),
    )
  }
}
