import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'

import { createAttachmentPresignedUrl } from '../../businessLayer/todosBusiness'
import { getToken, parseUserId } from '../../auth/utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    // Return a presigned URL to upload a file for a TODO item with the provided id
    const userId: string = parseUserId(getToken(event.headers.Authorization))
    const presignedUrl = await createAttachmentPresignedUrl(todoId, userId)

    return {
      statusCode: 200,
      body: JSON.stringify({ uploadUrl: presignedUrl })
    }
  }
)

handler.use(httpErrorHandler()).use(
  cors({
    credentials: true
  })
)
