import { S3Client } from '@aws-sdk/client-s3'
import { Config } from '../config'

export const createS3Client = ({ config }: { config: Config }) => {
  const s3Client = new S3Client({
    endpoint: config.s3.endpoint,
    region: config.s3.region,
    credentials: {
      accessKeyId: config.s3.credentials.accessKeyId,
      secretAccessKey: config.s3.credentials.secretAccessKey,
    },
    forcePathStyle: true,
  })

  return s3Client
}
