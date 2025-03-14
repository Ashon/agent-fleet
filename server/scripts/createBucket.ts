import {
  CreateBucketCommand,
  ListBucketsCommand,
  S3Client,
} from '@aws-sdk/client-s3'
import { config } from '../src/config'

const s3Client = new S3Client({
  endpoint: config.s3.endpoint,
  region: config.s3.region,
  credentials: {
    accessKeyId: config.s3.credentials.accessKeyId,
    secretAccessKey: config.s3.credentials.secretAccessKey,
  },
  forcePathStyle: true, // MinIO에는 이 옵션이 필요함
})

/**
 * Create new bucket
 * @param bucketName bucket name to create
 */
async function createBucket(bucketName: string): Promise<void> {
  try {
    // 버킷 리스트 확인
    const listResponse = await s3Client.send(new ListBucketsCommand({}))
    const bucketExists = listResponse.Buckets?.some(
      (bucket) => bucket.Name === bucketName,
    )

    if (bucketExists) {
      console.log(`Bucket '${bucketName}' already exists.`)
      return
    }

    // 버킷 생성
    const createBucketParams = {
      Bucket: bucketName,
    }

    const response = await s3Client.send(
      new CreateBucketCommand(createBucketParams),
    )
    console.log(`Bucket '${bucketName}' created successfully.`)
    console.log('Response:', response)
  } catch (error) {
    console.error('Error creating bucket:', error)
    throw error
  }
}

/**
 * Run script
 */
async function main() {
  if (process.argv.length < 3) {
    console.error(
      'Usage: ts-node create-bucket.ts <bucket-name> [bucket-name2] [bucket-name3] ...',
    )
    process.exit(1)
  }

  const bucketNames = process.argv.slice(2)

  for (const bucketName of bucketNames) {
    try {
      console.log(`Creating bucket '${bucketName}'...`)
      await createBucket(bucketName)
    } catch (error) {
      console.error(`Failed to create bucket '${bucketName}':`, error)
    }
  }
}

// Run script
main().catch((error) => {
  console.error('Error running script:', error)
  process.exit(1)
})
