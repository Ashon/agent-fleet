import dotenv from 'dotenv'

dotenv.config()

export const config = {
  listenPort: process.env.PORT || 3001,
  bucketName: process.env.BUCKET_NAME || 'agent-fleet',
  s3: {
    region: process.env.AWS_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || 'minio-root-user',
      secretAccessKey:
        process.env.S3_SECRET_ACCESS_KEY || 'minio-root-password',
    },
  },
}
