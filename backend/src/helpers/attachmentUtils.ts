import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const bucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

// Implement the fileStogare logic
const logger = createLogger('attachmentUtils')

export class AttachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({
      signatureVersion: 'v4'
    })
  ) {}

  getUploadUrl(todoId: string) {
    logger.info('Getting upload url ' + todoId + ' in bucket ' + bucketName)

    const url = this.s3.getSignedUrl('putObject', {
      Bucket: bucketName,
      Key: todoId,
      Expires: Number(urlExpiration)
    })

    logger.info('upload url found: ' + url)

    return url
  }
}
