import { S3Client } from '@aws-sdk/client-s3'

export const createS3Client = ({
  endpoint = '',
  region = '',
  accessKeyId = '',
  secretAccessKey = '',
  forcePathStyle = true,
}) => {
  const s3Client = new S3Client({
    endpoint,
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
    forcePathStyle,
  })

  return s3Client
}
