import { S3Client } from '@aws-sdk/client-s3'

export const s3 = new S3Client({
  region: process.env.S3_REGION!,
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY!,
  },
})

export const s3PublicUrl = 'https://allin-storage.s3.il-central-1.amazonaws.com/'

// git remote set-url origin https://github.com/zvijude/allin_app.git
// git remote set-url origin https://github.com/tomergahtan/base-next-allin-project.git
